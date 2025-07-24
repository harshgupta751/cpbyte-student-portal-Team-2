import React, { useLayoutEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { resetCheckStatus } from "../redux/slices/checkStatus";
import { Button } from "@mui/material";
import * as THREE from "three";

function AttendanceAlreadyMarked({ setIsMarked }) {
  const dispatch = useDispatch();

  const reset = () => {
    dispatch(resetCheckStatus());
    setIsMarked(0);
  };

  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useLayoutEffect(() => {
    const loadVanta = async () => {
      const VANTA = await import("vanta/dist/vanta.net.min");
      if (!vantaEffect.current && vantaRef.current) {
        vantaEffect.current = VANTA.default({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0xfff5,
          backgroundColor: 0x0,
          points: 20.0,
          maxDistance: 10.0,
          spacing: 20.0,
        });
      }
    };

    loadVanta();
    return () => {
      if (vantaEffect.current) vantaEffect.current.destroy();
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden flex item-center justify-center">
      {/* Vanta Background */}
      <div
        ref={vantaRef}
        className="fixed top-0 left-0 w-full h-full z-[-1]"
        style={{ zIndex: -1 }}
      />

      {/* Main Content */}
      <div className=" text-white min-h-screen w-full flex items-center justify-center pt-10">
  <div className="bg-white/10 backdrop-blur-md px-12 py-10 rounded-3xl shadow-2xl border border-white/60 text-center max-w-xl w-full">
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl md:text-5xl font-bold text-red-500 mb-6">
        Attendance Marked
      </h1>
      <p className="text-lg md:text-xl text-gray-300 mb-8">
        Attendance has been successfully marked.
      </p>
      <Button
        variant="contained"
        onClick={reset}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded text-lg"
        sx={{
          backgroundColor: "#0ec1e7",
          "&:hover": {
            backgroundColor: "#0ea2e7",
          },
        }}
      >
        Go Back
      </Button>
      </div>
    </div>
  </div>
    </div>
  );
}

export default AttendanceAlreadyMarked;