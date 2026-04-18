const supabase = require("../../config/supabase")
const { hashPassword, comparePassword } = require("../../utils/auth")
const jwt = require("jsonwebtoken")

class AuthService {

  async signup (name, phone, email, password,role) {
		console.log(role)
    try {
      if (!name) return { message: "Name is required", status: 400 }
      if (!phone) return { message: "Phone is required", status: 400 }
      if (!email) return { message: "Email is required", status: 400 }
      if (!password) return { message: "Password is required", status: 400 }

      const user = await supabase.from("users").select("*").eq("email", email).single();
      if (user.data) return { message: "User already exists", status: 400 }

      const hashedPassword = await hashPassword(password);
      await supabase.from("users").insert({
        name,
        phone,
        email,
        password: hashedPassword,
        role
      })
      return {
        message: "User created successfully",
        status: 201
      }
    } catch (error) {
      return { message: error.message || "Internal server error", status: 500 }
    }
  }

	async login (email, password) {
		try {
			if (!email) return { message: "Email is required", status: 400 }
			if (!password) return { message: "Password is required", status: 400 }

			const {data} = await supabase.from("users").select("*").eq("email", email).single();
			if (!data) return { message: "user not found", status: 404 }

			const validPassword = await comparePassword(password, data.password);
			if (!validPassword) return { message: "Invalid Credentials", status: 401 }

			data.password = undefined

			const token = jwt.sign({id: data.id, role: data.role }, process.env.SECRET, { expiresIn: "30d" });
			return { token, user: data, message: "User logged in successfully", status: 200 }
		} catch (error) {
			return { message: error.message || "Internal server error", status: 500 }
		}
	}
}

module.exports = new AuthService()