const authService = require("./auth.service")

class AuthController {

  async signup (req, res) {
    try {
      const { name, phone, email, password,role } = req.body
      const result = await authService.signup(name, phone, email, password,role)
      return res.status(result.status).json(result)
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  }

	async login (req, res) {
		try {
			const { email, password } = req.body
			const result = await authService.login(email, password)
			return res.status(result.status).json(result)
		} catch (error) {
			return res.status(500).json({ message: error.message })
		}
	}
}

module.exports = new AuthController()