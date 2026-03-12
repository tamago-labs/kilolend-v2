export const Home = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-center py-32 px-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-slate-900 mb-6">
            Welcome to KiloLend
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The capital layer for AI agents — enabling autonomous lending, borrowing, swapping, and on-chain execution through programmable wallets.
          </p>
        </div>
      </div>
    </div>
  );
};