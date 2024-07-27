import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req){
    const res = NextResponse.next();

    const supabase = createMiddlewareClient({ req, res });

    const { data : {session} } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.rewrite(new URL('/auth/login', req.url))
    }

    return res
}


export const config = {
    matcher: [
        // '/card1/:path*',
        // '/card2/:path*',
        '/auth'
    ]
}