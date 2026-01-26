import { AlertTriangle, Snowflake } from "lucide-react";

interface AccountFrozenBannerProps {
  reason?: string | null;
}

const AccountFrozenBanner = ({ reason }: AccountFrozenBannerProps) => {
  return (
    <div className="bg-destructive/20 border border-destructive/50 rounded-xl p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-destructive/30 flex items-center justify-center flex-shrink-0">
        <Snowflake className="w-5 h-5 text-destructive" />
      </div>
      <div>
        <h3 className="font-semibold text-destructive">Account Frozen</h3>
        <p className="text-sm text-destructive/80">
          Your account has been frozen and you cannot make transactions.
          {reason && (
            <span className="block mt-1">
              <strong>Reason:</strong> {reason}
            </span>
          )}
        </p>
        <p className="text-sm text-destructive/80 mt-2">
          Please contact support if you believe this is an error.
        </p>
      </div>
    </div>
  );
};

export default AccountFrozenBanner;
