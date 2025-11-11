import CreateAcc from "./pages/CreateAcc.tsx"
import React from 'react'
import type { User } from "./types/register.ts"

const App = () => {
  return (
    <CreateAcc onNext={function (user: User): void {
          throw new Error("Function not implemented.")
      } }/>
  )
}

export default App