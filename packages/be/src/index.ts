import { Hono } from "hono"

const app = new Hono()

app.get("/", c => {
  return c.text("Hello Hono!")
})

const todos = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Hehe" }
]

app.get("/api/todos", c => {
  return c.json(todos)
})

export default {
  fetch: app.fetch,
  port: 3333
}
