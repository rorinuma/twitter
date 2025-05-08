import { FaXTwitter } from "react-icons/fa6";
import GoogleButton from "../components/GoogleButton";
import LineBreak from "../components/LineBreak";
import HugeButton from "../components/HugeButton";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh flex-1">
      <main className="flex flex-1">
        <section className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center">
          <FaXTwitter className="w-1/2 h-1/2" />
        </section>
        <section className="flex flex-1 items-center justify-center">
          <div className="flex flex-col w-4/5">
            <FaXTwitter className="flex lg:hidden size-12 mt-8 mb-14 " />
            <h1 className="text-6xl font-extrabold">Happening now</h1>
            <h2 className="text-4xl mt-12 font-bold">Join today.</h2>
            <div className="flex flex-col w-[300px] mt-10 gap-2">
              <GoogleButton />
              <LineBreak text="OR" />
              <HugeButton href="signup" text="Create account" bg="blue" />
              <div className="mt-10 font-bold text-lg">
                Already have an account?
              </div>
              <div className="mt-2">
                <HugeButton href="signin" text="Sign in" bg="transparent" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex"></footer>
    </div>
  );
}
