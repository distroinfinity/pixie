import { Message_data } from "../public/contexts/userContexts";
import { useContext } from "react";
import { useRouter } from "next/router";

import React from "react";

const Share = () => {
  const { message } = useContext(Message_data);
  var router = useRouter();

  return (
    <>
      <div>Shared value is {message}</div>
      <div
        onClick={() => router.push("/")}
        className="mx-16 font-bold text-xl text-gray-600 cursor-pointer"
      >
        first component
      </div>
    </>
  );
};

export default Share;
