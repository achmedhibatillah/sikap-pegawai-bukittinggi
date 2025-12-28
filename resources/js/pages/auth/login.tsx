import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { IoMdLogIn } from "react-icons/io";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";

import InputTextAuth from "@/component/input-text-auth";
import Button from "@/component/button";
import ErrorInput from "@/component/error-input";
import ErrorFlash from "@/component/error-flash";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const loginFormik = useFormik({
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema: Yup.object({
      email: Yup.string().required("Email wajib diisi."),
      password: Yup.string().required("Password wajib diisi.")
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setResponse(null);

      try {
        const { data } = await axios.post("/login", values);
        if (data.status === "success") {
          window.location.href = "/dashboard";
        } else {
          setResponse("Autentikasi gagal. Periksa email dan password.");
        }
      } catch {
        setResponse("Server tidak merespon.");
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className="min-h-screen bg-basic flex items-center justify-center px-4">
      <div className="
        w-full max-w-sm
        rounded-2xl
        bg-basic
        shadow-xl
        ring-1 ring-black/5
        overflow-hidden
      ">
        {/* Header */}
        <div className="bg-middle px-6 py-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-wide text-green-950">
            SIKAP
          </h1>
          <p className="mt-1 text-sm italic leading-tight text-gray-600">
            Sistem Informasi Pegawai <br />
            Puskesmas Bukittinggi
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-6">
          <h2 className="mb-4 text-2xl font-bold text-green-800">
            Login
          </h2>

          {response && (
            <div className="mb-4">
              <ErrorFlash>{response}</ErrorFlash>
            </div>
          )}

          <form
            onSubmit={loginFormik.handleSubmit}
            className="space-y-4"
          >
            <div>
              <InputTextAuth
                name="email"
                type="text"
                icon={FaUser}
                placeholder="Email"
                value={loginFormik.values.email}
                onChange={loginFormik.handleChange}
                disabled={loading}
              />
              {loginFormik.touched.email && loginFormik.errors.email && (
                <ErrorInput className="mt-1">
                  {loginFormik.errors.email}
                </ErrorInput>
              )}
            </div>

            <div>
              <InputTextAuth
                name="password"
                type="password"
                icon={FaLock}
                placeholder="Password"
                value={loginFormik.values.password}
                onChange={loginFormik.handleChange}
                disabled={loading}
              />
              {loginFormik.touched.password && loginFormik.errors.password && (
                <ErrorInput className="mt-1">
                  {loginFormik.errors.password}
                </ErrorInput>
              )}
            </div>

            <Button
              type="submit"
              color="success"
              className="mt-6 w-full py-2.5 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                "Loading..."
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <IoMdLogIn size={18} />
                  Login
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
