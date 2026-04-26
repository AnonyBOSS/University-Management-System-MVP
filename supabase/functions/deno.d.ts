declare const Deno: {
  env: { get(key: string): string | undefined };
};

declare module "https://deno.land/*";
declare module "https://esm.sh/*";
