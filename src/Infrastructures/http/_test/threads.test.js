const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');

describe('/threads endpoint', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 401 when request did not have access token', async () => {
      const requestPayload = {
        title: 'judul',
        body: 'isi body',
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when post thread invalid body request', async () => {
      const requestPayload = {
        title: 'judul',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan thread baru karena property yang dibutuhkan tidak ada');
    });

    it('should response 400 when post thread not meet data type specification', async () => {
      const requestPayload = {
        title: [123],
        body: ['123'],
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan thread baru karena tipe data tidak sesuai');
    });

    it('should response 201 and persisted thread', async () => {
      const requestPayload = {
        title: 'judul',
        body: 'isi body',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toBeDefined();
      expect(responseJson.data.addedThread.owner).toBeDefined();
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 when get thread detail correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentTableTestHelper.addComment({ id: 'comment-123' });

      const server = await createServer(container);

      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual('thread-123');
      expect(responseJson.data.thread.title).toBeDefined();
      expect(responseJson.data.thread.body).toBeDefined();
      expect(responseJson.data.thread.date).toBeDefined();
      expect(responseJson.data.thread.username).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments[0].id).toEqual('comment-123');
      expect(responseJson.data.thread.comments[0].username).toBeDefined();
      expect(responseJson.data.thread.comments[0].date).toBeDefined();
    });

    it('should return content to be **komentar telah dihapus** after deleted comment', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'zulva' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentTableTestHelper.addComment({ id: 'comment-321', content: 'isi comment', isDelete: false });
      await CommentTableTestHelper.addComment({ id: 'comment-123', content: '**komentar telah dihapus**', isDelete: true });

      const server = await createServer(container);

      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.comments[0].content).toEqual('**komentar telah dihapus**');
    });
  });
});
