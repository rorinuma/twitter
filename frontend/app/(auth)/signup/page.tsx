import SignUp from "../@authModals/signup/page";
import LandingPage from "../page";

export default function SignUpFallback() {
  return (
    <>
      <LandingPage />
      <SignUp />
    </>
  );
}
