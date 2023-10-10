const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');

describe('/comments endpoint', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 404 when thread not found', async () => {
      const requestPayload = {
        content: 'isi comment',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-321/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Gagal! Thread tidak ditemukan');
    });

    it('should response 401 when you are not autorized', async () => {
      const requestPayload = {
        content: 'isi comment',
      };
      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when add comment not contain needed property', async () => {
      const requestPayload = {};

      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'isi title',
        body: 'isi body',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan comment baru karena property yang dibutuhkan tidak ada');
    });

    it('should response 400 when add comment not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: 123,
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'isi title',
        body: 'isi body',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan comment baru karena tipe data tidak sesuai');
    });

    it('should response 200 when add comment correctly', async () => {
      const requestPayload = {
        content: 'Need Help',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'judul',
        body: 'isi body',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toBeDefined();
      expect(responseJson.data.addedComment.owner).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 404 when thread not found', async () => {
      const requestPayload = {
        content: 'isi comment',
      };

      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken();

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Gagal! Thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      const requestPayload = {
        content: 'isi comment',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'judul',
        body: 'isi body',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Gagal! komen tidak ditemukan');
    });

    it('should response 403 when deleting non-belonging comments ', async () => {
      const requestPayload = {
        content: 'isi comment',
      };

      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken();

      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'johndoe',
        password: 'inipasswordy',
        fullname: 'John Doe',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-456',
        title: 'isi title',
        body: 'isi body',
        owner: 'user-456',
        date: '2023-09-25T11:52:48.150Z',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-456',
        threadId: 'thread-456',
        content: 'isi content',
        owner: 'user-456',
      });

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-456/comments/comment-456',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Gagal! Anda tidak memiliki akses');
    });

    it('should response 401 when request did not have accesToken', async () => {
      const requestPayload = {
        content: 'isi comment',
      };

      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'test title',
        body: 'test body',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'test content',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 200 when delete comment correctly', async () => {
      const requestPayload = {
        content: 'test content',
      };

      const accessToken = await ServerTestHelper.getAccessToken();

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'test title',
        body: 'test body',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'test content',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });

      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
