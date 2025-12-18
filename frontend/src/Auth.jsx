// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import ReCAPTCHA from "react-google-recaptcha";
import { setAuth } from "@/lib/AuthHelpers";
import {
  MessageTypes,
  MessageTypeToColor,
  useMessage,
} from "@/hooks/use-message";
import { requestToBackend } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";

export function Auth({ setIsAuthenticated }) {
  const Status = Object.freeze({
    LOGIN: "LOGIN",
    SIGNUP: "SIGNUP",
  });
  const [mode, setMode] = useState(Status.LOGIN);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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
            setLoginData={setLoginData}
          />
        )}
      </div>
    </div>
  );
}

function LoginForm({ data, onChange, onSwitch, setIsAuthenticated }) {
  const navigate = useNavigate();
  const { message, isShowMessage, messageType, showMessage, resetMessage } =
    useMessage();
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef();

  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessage();

    if (!recaptchaToken) {
      showMessage(
        "To proceed, please complete reCaptcha first.",
        MessageTypes.ERROR
      );
      return;
    }

    showMessage("Waiting server response...", MessageTypes.NORMAL);
    const result = await requestToBackend("POST", "auth/login", {
      email: data.email,
      password: data.password,
      recaptchaToken: recaptchaToken,
    });

    if (
      !result.ok ||
      !result?.data ||
      !result?.data?.token ||
      !result?.data?.user
    ) {
      const errMsg =
        (result?.error || "Error: Something went wrong.") +
        " Please try again.";
      showMessage(errMsg, MessageTypes.ERROR);
      return;
    }

    showMessage(
      "Success! You should be redirected soon...",
      MessageTypes.SPECIAL
    );
    const { token, user } = result.data;
    setAuth({ token, user });
    setIsAuthenticated(true);
    navigate("/");
  };

  return (
    <Card className="w-full max-w-sm">
      <CardContent>
        <CardHeader className="flex flex-col items-center text-center py-2 pb-5">
          <CardTitle className="text-2xl font-bold">
            Login to your account
          </CardTitle>
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
                value={data.email}
                onChange={(e) => onChange({ ...data, email: e.target.value })}
              />
            </Field>

            {/* Password */}
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                required
                value={data.password}
                onChange={(p) =>
                  onChange({ ...data, password: p.target.value })
                }
              />
            </Field>

            {/* Recaptcha */}
            <Field>
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LfqNiosAAAAAB7JO71byBvTGdPOgk4g5l-hWyYB" // Public key
                  onChange={setRecaptchaToken}
                  onErrored={() =>
                    showMessage(
                      "(Recaptcha) Network error. Please try again later.",
                      MessageTypes.ERROR
                    )
                  }
                />
              </div>
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
                  onClick={onSwitch}
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
  );
}

function SignUpForm({ data, onChange, onSwitch, setLoginData }) {
  const { message, isShowMessage, messageType, showMessage, resetMessage } =
    useMessage();
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef();

  const handleSignup = async (e) => {
    e.preventDefault();
    resetMessage();

    if (data.password !== data.confirmPassword) {
      showMessage(
        "Confirm password do not match the actual password. Please try again",
        MessageTypes.ERROR
      );
      return;
    }

    if (!recaptchaToken) {
      showMessage(
        "To proceed, please complete reCaptcha first.",
        MessageTypes.ERROR
      );
      return;
    }

    showMessage("Waiting server response...", MessageTypes.NORMAL);
    const result = await requestToBackend("POST", "auth/register", {
      username: data.username,
      email: data.email,
      password: data.password,
      recaptchaToken: recaptchaToken,
    });

    if (!result.ok || !result?.data) {
      const errMsg =
        (result?.error || "Error: Something went wrong.") +
        " Please try again.";
      showMessage(errMsg, MessageTypes.ERROR);
      return;
    }

    showMessage(
      "Account created! You will be redirected soon...",
      MessageTypes.SPECIAL
    );

    // Reset input fields
    onChange({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    // Set email for login
    setLoginData({
      email: data.email,
    });

    setTimeout(onSwitch, 3000);
  };

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
                value={data.username}
                onChange={(u) =>
                  onChange({ ...data, username: u.target.value })
                }
              />
            </Field>

            {/* Email */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                required
                value={data.email}
                onChange={(e) => onChange({ ...data, email: e.target.value })}
              />
            </Field>

            {/* Password */}
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                required
                value={data.password}
                onChange={(p) =>
                  onChange({ ...data, password: p.target.value })
                }
              />
            </Field>

            {/* Confirm password */}
            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={data.confirmPassword}
                onChange={(p) =>
                  onChange({ ...data, confirmPassword: p.target.value })
                }
              />
            </Field>

            {/* Feedback message */}
            <p
              hidden={!isShowMessage}
              className={cn("text-center", MessageTypeToColor[messageType])}
            >
              {message}
            </p>

            {/* Recaptcha */}
            <Field>
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LfqNiosAAAAAB7JO71byBvTGdPOgk4g5l-hWyYB" // Public key
                  onChange={setRecaptchaToken}
                  onErrored={() =>
                    showMessage(
                      "(Recaptcha) Network error. Please try again later.",
                      MessageTypes.ERROR
                    )
                  }
                />
              </div>
            </Field>

            {/* Submit button */}
            <Field>
              <Button type="submit">Create Account</Button>
            </Field>
            <Field>
              <FieldDescription className="text-center">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitch}
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
  );
}
