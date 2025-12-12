import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/lib/AuthContext";
import {
  MessageTypes,
  MessageTypeToColor,
  useMessage
} from "@/hooks/useMessage";
import { useNavigate } from "react-router-dom";
import { useState } from "react"


export function Auth({ setIsAuthenticated }) {
  const Status = Object.freeze({
    LOGIN: 'LOGIN',
    SIGNUP: 'SIGNUP',
  });
  const [mode, setMode] = useState(Status.LOGIN)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  return (
    <div className="flex min-h-svh flex-col">
      {/* Top bar */}
      <div className="flex p-6">
        {/* Logo */}
        <button
          type="button"
          className="font-medium cursor-pointer"
          onClick={() => setMode(Status.LOGIN)}
        >
          Cultural HK
        </button>

        {/* Dark mode toggle */}
        <div className="ml-auto">
          <ModeToggle />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center">
        {mode === Status.LOGIN ? (
          <LoginForm
            data={loginData}
            onChange={setLoginData}
            onSwitch={() => setMode(Status.SIGNUP)}
            setIsAuthenticated={setIsAuthenticated}
          />
        ) : (
          <SignUpForm
            data={signupData}
            onChange={setSignupData}
            onSwitch={() => setMode(Status.LOGIN)}
          />
        )}
      </div>
    </div>
  )
}

function LoginForm(props) {
  const { loginAs } = useAuth();
  const navigate = useNavigate();
  const {
    message,
    isShowMessage,
    messageType,
    showMessage,
    resetMessage,
  } = useMessage();

  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessage();

    try {
      showMessage("Waiting server response...", MessageTypes.NORMAL);
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: props.data.email,
          password: props.data.password,
        }),
      })

      if (!res.ok) {
        // Get error message
        let uiMessage = "Login failed. Please try again.";
        try {
          const data = await res.json();
          if (data?.error) {
            uiMessage = data.error;
          }
        } catch {
          // Do nothing
        }

        showMessage(uiMessage, MessageTypes.ERROR);
        return;
      }

      showMessage("Success! You should be redirected soon...", MessageTypes.SPECIAL)
      const { token, user } = await res.json();
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      loginAs(user);
      props.setIsAuthenticated(true);
      navigate("/");
    } catch (err) {
      showMessage("Network error, Please try again later.", MessageTypes.ERROR);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardContent>
        <CardHeader className="flex flex-col items-center text-center py-2 pb-5">
          <CardTitle className="text-2xl font-bold">Login to your account</CardTitle>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <FieldGroup>
            {/* Email */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                required
                value={props.data.email}
                onChange={e => props.onChange({ ...props.data, email: e.target.value })}
              />
            </Field>

            {/* Password */}
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                required
                value={props.data.password}
                onChange={p => props.onChange({ ...props.data, password: p.target.value })}
              />
            </Field>

            {/* Feedback message */}
            <p
              hidden={!isShowMessage}
              className={cn("text-center", MessageTypeToColor[messageType])}
            >
              {message}
            </p>

            {/* Submit button */}
            <Field>
              <Button type="submit">Login</Button>
            </Field>

            {/* Navigation to sign up */}
            <Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={props.onSwitch}
                  className="underline underline-offset-4"
                >
                  Sign up
                </button>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

function SignUpForm(props) {
  const {
    message,
    isShowMessage,
    messageType,
    showMessage,
    resetMessage,
  } = useMessage();

  const handleSignup = async (e) => {
    e.preventDefault()
    resetMessage();

    if (props.data.password !== props.data.confirmPassword) {
      showMessage("Confirm password do not match the actual password. Please try again", MessageTypes.ERROR);
      return
    }

    try {
      showMessage("Waiting server response...", MessageTypes.NORMAL);
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: props.data.username,
          email: props.data.email,
          password: props.data.password,
        }),
      })

      if (!res.ok) {
        // Get error message
        let uiMessage = "Login failed. Please try again.";
        try {
          const data = await res.json();
          if (data?.error) {
            uiMessage = data.error;
          }
        } catch {
          // Do nothing
        }

        showMessage(uiMessage, MessageTypes.ERROR);
        return;
      }

      showMessage("Account created! You will be redirected soon...", MessageTypes.SPECIAL);

      // Reset input fields
      props.onChange({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(props.onSwitch, 4000);
    } catch (err) {
      showMessage("Network error, Please try again later.", MessageTypes.ERROR);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent>
        <CardHeader className="flex flex-col items-center text-center py-2 pb-5">
          <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <FieldGroup>
            {/* Usernme */}
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                required
                value={props.data.username}
                onChange={u => props.onChange({ ...props.data, username: u.target.value })}
              />
            </Field>

            {/* Email */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                required
                value={props.data.email}
                onChange={e => props.onChange({ ...props.data, email: e.target.value })}
              />
            </Field>

            {/* Password */}
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                required
                value={props.data.password}
                onChange={p => props.onChange({ ...props.data, password: p.target.value })}
              />
            </Field>

            {/* Confirm password */}
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={props.data.confirmPassword}
                onChange={p => props.onChange({ ...props.data, confirmPassword: p.target.value })}
              />
            </Field>

            {/* Feedback message */}
            <p
              hidden={!isShowMessage}
              className={cn("text-center", MessageTypeToColor[messageType])}
            >
              {message}
            </p>

            {/* Submit button */}
            <Field>
              <Button type="submit">Create Account</Button>
            </Field>
            <Field>
              <FieldDescription className="text-center">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={props.onSwitch}
                  className="underline underline-offset-4"
                >
                  Sign in
                </button>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}