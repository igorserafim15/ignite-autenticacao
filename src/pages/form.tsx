import { ChangeEvent, FormEvent, useState } from 'react'
import { useAuthContext } from '../context/auth-context'

export function Form() {
  const { signIn } = useAuthContext()

  const [values, setValues] = useState({ email: '', password: '' })

  function handleChange(ev: ChangeEvent<HTMLInputElement>) {
    setValues((prev) => ({ ...prev, [ev.target.name]: ev.target.value }))
  }

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    signIn(values)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          onChange={handleChange}
          value={values.email}
        />
      </div>

      <div>
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="text"
          name="password"
          onChange={handleChange}
          value={values.password}
        />
      </div>

      <button type="submit">Entrar</button>
    </form>
  )
}
