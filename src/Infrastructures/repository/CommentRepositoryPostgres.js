const AddedComment = require('../../Domains/comments/entities/AddedComment');
const GetComment = require('../../Domains/comments/entities/GetComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addCommentThread(newComment) {
    const { threadId, content, owner } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDelete = false;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, threadId, content, owner, date, isDelete],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyCommentAccess(commentId, owner) {
    const query = {
      text: 'SELECT 1 FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthorizationError('You are not authorized to access');
    }
  }

  async getCommentById(commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Comments not found!');
    }

    return commentId;
  }

  async getComment(threadId) {
    const query = {
      text: `SELECT comments.id, users.username, comments.date, comments.content, comments.is_delete FROM comments
      LEFT JOIN users ON comments.owner = users.id WHERE comments.thread_id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Comments not found!');
    }

    return result.rows.map(
      (payload) =>
        new GetComment({
          id: payload.id,
          username: payload.username,
          date: payload.date,
          content: payload.content,
          isDelete: payload.is_delete,
        })
    );
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Comment not found!');
    }
  }
}

module.exports = CommentRepositoryPostgres;
