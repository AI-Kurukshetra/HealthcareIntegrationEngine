import { logoutAction } from "@/lib/auth/actions";

import { Button } from "@/components/ui/button";

export function LogoutForm() {
  return (
    <form action={logoutAction}>
      <Button type="submit" className="bg-rose-600 text-white hover:bg-rose-700">
        Log out
      </Button>
    </form>
  );
}
