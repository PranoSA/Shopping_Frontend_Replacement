/* eslint-disable @typescript-eslint/no-unused-vars */
import { afterEach, beforeAll, afterAll} from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { setupServer } from 'msw/node'
import { graphql, rest } from 'msw'

import { Group } from '../types/group';

const Groups : Group[] = [];

const posts = [
  {
    userId: 1,
    id: 1,
    title: 'first post title',
    body: 'first post body',
  },
  {
    userId: 1,
    id: 4,
    title: 'first post title',
    body: 'first post body',
  }
  // ...
]

const restHandlers = [
  rest.get('http://localhost:8080/groups', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(posts))
  }),

  rest.post("http://localhost:8080/group", (req,res,ctx) => {
    return res(ctx.status(200), ctx.json(req.bodyUsed));
  })
]
const server = setupServer(...restHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers())

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

