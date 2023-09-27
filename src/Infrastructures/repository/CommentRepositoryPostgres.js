const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
// const NotFoundError = require('../../Commons/exceptions/NotFoundError');

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

  // async getCommentByThreadId(threadId) {
  //   const query = {
  //     text: 'SELECT id, owner, content, date, is_delete FROM comments WHERE thread_id = $1',
  //     values: [threadId],
  //   };

  //   const result = await this._pool.query(query);

  //   if (!result.rowCount) {
  //     throw new NotFoundError('Komentar tidak ada');
  //   }

  //   return result.rows.map((comment) => ({
  //     ...comment,
  //   }));
  // }
}

module.exports = CommentRepositoryPostgres;
