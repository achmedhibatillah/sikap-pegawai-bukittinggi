import { useEffect, useState } from "react";
import { RiCloseFill } from "react-icons/ri";

interface PopUpRightProps {
  name: string;
  children: React.ReactNode;
  state: boolean;
  setState: (value: boolean) => void;
  dangerWhenClose?: boolean;
}

const PopUpRight = ({
  name,
  children,
  state,
  setState,
  dangerWhenClose = false,
}: PopUpRightProps) => {
  const [show, setShow] = useState(state);
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    if (state) setShow(true);
    else {
      const timeout = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [state]);

  if (!show) return null;

  const handleClose = () => {
    if (dangerWhenClose) {
      setConfirmClose(true);
    } else {
      setState(false);
    }
  };

  const confirmYes = () => {
    setConfirmClose(false);
    setState(false);
  };

  const confirmNo = () => {
    setConfirmClose(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
          state ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      ></div>

      <div
        className={`fixed right-0 top-0 h-full bg-white shadow-md rounded-l-md p-6 overflow-y-auto transition-transform duration-300 transform ${
          state ? "translate-x-0" : "translate-x-full"
        } w-[90%] lg:w-[50%]`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-green-900 font-bold text-2xl">{name}</h2>
          <div
            className="cursor-pointer w-[30px] h-[30px] rounded-full bg-red-200 hover:bg-red-300 transition flex justify-center items-center text-red-800"
            onClick={handleClose}
          >
            <RiCloseFill size={20} />
          </div>
        </div>

        <div>{children}</div>
      </div>

      {confirmClose && (
        <div className="fixed inset-0 flex items-center justify-center z-60">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="bg-white p-6 rounded-md shadow-lg z-70 transform transition-all duration-300 scale-100 mx-5">
            <div className="mb-4">
              <p className="mb-2 text-red-800 text-center">Apakah Anda yakin ingin menutup tab ini?</p>
              <p className="text-gray-600 text-center text-sm font-light">Jika tab ditutup, segala perubahan data dan informasi tidak akan tersimpan.</p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition cursor-pointer"
                onClick={confirmYes}
              >
                Ya, tutup
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition cursor-pointer"
                onClick={confirmNo}
              >
                Tidak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopUpRight;
