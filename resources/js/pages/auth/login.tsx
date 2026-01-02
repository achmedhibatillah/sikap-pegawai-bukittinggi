import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { IoMdLogIn } from "react-icons/io";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "@inertiajs/react";

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
    <div className="min-h-screen bg-[#FFFCF7] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#C2D8B9] to-[#A3C49A] rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <span className="text-[#1D3009] font-bold text-2xl">S</span>
            </div>
          </Link>
          <h1 className="text-4xl font-extrabold tracking-wide text-[#1D3009]">
            SIKAP
          </h1>
          <p className="mt-2 text-[#3D4D2A] italic">
            Sistem Informasi Kepegawaian <br />
            Puskesmas Tanahtinggi
          </p>
        </div>

        {/* Login Card */}
        <div className="
          w-full
          rounded-3xl
          bg-white
          shadow-2xl
          ring-1 ring-[#C2D8B9]/50
          overflow-hidden
        ">
          {/* Decorative Header */}
          <div className="h-2 bg-gradient-to-r from-[#C2D8B9] via-[#2D5016] to-[#C2D8B9]"></div>

          {/* Form */}
          <div className="px-8 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#E4F0D0] to-[#C2D8B9] rounded-xl flex items-center justify-center">
                <IoMdLogIn className="w-5 h-5 text-[#2D5016]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1D3009]">
                  Welcome Back
                </h2>
                <p className="text-sm text-[#3D4D2A]">
                  Silakan login untuk melanjutkan
                </p>
              </div>
            </div>

            {response && (
              <div className="mb-6">
                <ErrorFlash>{response}</ErrorFlash>
              </div>
            )}

            <form
              onSubmit={loginFormik.handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-[#2D5016] mb-2">
                  Email
                </label>
                <InputTextAuth
                  name="email"
                  type="text"
                  icon={FaUser}
                  placeholder="Masukkan email Anda"
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
                <label className="block text-sm font-medium text-[#2D5016] mb-2">
                  Password
                </label>
                <InputTextAuth
                  name="password"
                  type="password"
                  icon={FaLock}
                  placeholder="Masukkan password Anda"
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#C2D8B9] text-[#2D5016] focus:ring-[#2D5016]"
                  />
                  <span className="text-[#3D4D2A]">Ingat saya</span>
                </label>
              </div>

              <Button
                type="submit"
                color="success"
                className="w-full py-3 text-base font-semibold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memuat...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <IoMdLogIn size={20} />
                    Login
                  </span>
                )}
              </Button>
            </form>

            {/* Footer Link */}
            <div className="mt-6 pt-6 border-t border-[#E4F0D0] text-center">
              <p className="text-sm text-[#3D4D2A]">
                Kembali ke{" "}
                <Link href="/" className="text-[#2D5016] hover:text-[#1D3009] font-medium transition-colors">
                  Beranda
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-[#3D4D2A]">
          &copy; {new Date().getFullYear()} SIKAP. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

