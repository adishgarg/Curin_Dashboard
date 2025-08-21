import { useState } from "react"
import { Mail, Lock, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { loginService } from "../services/api/login"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = await loginService.login({email, password})
      console.log("Login success:", data)

      localStorage.setItem("token", data.data.token)
      navigate("/")
    } catch (err) {
      setError(err.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Login to Curin
        </h2>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1 flex items-center border border-gray-300 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400 ml-3" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="flex-1 px-3 py-2 rounded-r-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 flex items-center border border-gray-300 rounded-lg">
              <Lock className="w-5 h-5 text-gray-400 ml-3" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="flex-1 px-3 py-2 rounded-r-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Forgot password */}
          <div className="flex justify-end">
            <Link
              to="/reset-password"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}


          </button>


          {/* <button
            type="submit"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault()
              navigate("/") // 👈 Redirects user to Home
            }}
            className="w-full flex items-center justify-center bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
          </button> */}
        </form>
      </div>
    </div>
  )
}
