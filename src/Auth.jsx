import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { ModeToggle } from "@/components/mode-toggle"
import { Input } from "@/components/ui/input"

export function Auth() {
  const [mode, setMode] = useState("login") // "login" | "signup"
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex p-6">
        <button
          type="button"
          className="font-medium cursor-pointer"
          onClick={() => setMode("login")}
        >
          Project
        </button>

        <div className="ml-auto">
          <ModeToggle />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">
        {mode === "login" ? (
          <LoginForm
            data={loginData}
            onChange={setLoginData}
            onSwitch={() => setMode("signup")}
          />
        ) : (
          <SignUpForm
            data={signupData}
            onChange={setSignupData}
            onSwitch={() => setMode("login")}
          />
        )}
      </div>
    </div>
  )
}

function LoginForm(props) {
  return (
    <Card className="w-full max-w-sm">
      <CardContent>
        <CardHeader className="flex flex-col items-center text-center py-2 pb-5">
          <CardTitle className="text-2xl font-bold">Login to your account</CardTitle>
        </CardHeader>
        <form>
          <FieldGroup>
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
            <Field>
              <Button type="submit">Login</Button>
            </Field>
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
  return (
    <Card className="w-full max-w-sm">
      <CardContent>
        <CardHeader className="flex flex-col items-center text-center py-2 pb-5">
          <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
        </CardHeader>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                required
                value={props.data.username}
                onChange={u => props.onChange({ ...props.data, username: u.target.value })}
              />
            </Field>
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
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={props.data.confirmPassword}
                onChange={p => props.onChange({ ...props.data, password: p.target.value })}
              />
            </Field>
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