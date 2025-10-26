import { SignUp } from "@clerk/nextjs";
import { dark } from '@clerk/themes';

export default function SignUpPage() {
  return (
    // Outer container
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117] p-4">
       {/* Wrapper div */}
      <div className="bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e293b] p-1 rounded-xl shadow-2xl border border-gray-700/50">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          appearance={{
            baseTheme: dark,
            elements: {
              formButtonPrimary: 'bg-teal-500 hover:bg-teal-400 text-sm normal-case text-black',
              // card: 'bg-[#161B22] border border-gray-700 shadow-xl', // <-- Remove or comment out
              card: 'bg-transparent border-none shadow-none', // Make Clerk card transparent
              headerTitle: 'text-white',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton: 'border-gray-600 hover:bg-gray-700',
              socialButtonsBlockButtonText: 'text-gray-300',
              formFieldInput: 'bg-gray-800 border-gray-600 text-white focus:ring-teal-500 focus:border-teal-500',
              footerActionText: 'text-gray-400',
              footerActionLink: 'text-teal-400 hover:text-teal-300'
            }
          }}
        />
      </div>
    </div>
  );
}