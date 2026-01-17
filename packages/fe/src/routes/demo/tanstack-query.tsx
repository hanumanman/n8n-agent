import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { sleep } from '@/lib/utils'

export const Route = createFileRoute('/demo/tanstack-query')({
  component: TanStackQueryDemo,
})

async function fetchTodos(): Promise<Array<{ id: number; name: string }>> {
  const response = await fetch('/api/todos')
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  await sleep(1000)
  return response.json()
}

function TanStackQueryDemo() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-linear-to-br from-purple-100 to-blue-100 p-4 text-white"
        style={{
          backgroundImage:
            'radial-gradient(50% 50% at 95% 5%, #f4a460 0%, #8b4513 70%, #1a0f0a 100%)',
        }}
      >
        <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10">
          <h1 className="text-2xl mb-4">Loading...</h1>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-linear-to-br from-purple-100 to-blue-100 p-4 text-white"
        style={{
          backgroundImage:
            'radial-gradient(50% 50% at 95% 5%, #f4a460 0%, #8b4513 70%, #1a0f0a 100%)',
        }}
      >
        <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10">
          <h1 className="text-2xl mb-4">Error: {error.message}</h1>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-linear-to-br from-purple-100 to-blue-100 p-4 text-white"
      style={{
        backgroundImage:
          'radial-gradient(50% 50% at 95% 5%, #f4a460 0%, #8b4513 70%, #1a0f0a 100%)',
      }}
    >
      <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10">
        <h1 className="text-2xl mb-4">TanStack Query - Fetch from Backend</h1>
        <ul className="mb-4 space-y-2">
          {data?.map((todo) => (
            <li
              key={todo.id}
              className="bg-white/10 border border-white/20 rounded-lg p-3 backdrop-blur-sm shadow-md"
            >
              <span className="text-lg text-white">{todo.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
