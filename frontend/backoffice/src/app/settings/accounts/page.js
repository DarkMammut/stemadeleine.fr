"use client";

import {Suspense, useState} from "react";
import Layout from "@/components/ui/Layout";
import Accounts from "@/scenes/Accounts";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

function AccountsContent() {
    return <Accounts/>;
}

export default function UsersPage() {
    const [current, setCurrent] = useState("settings");

    return (
        <Layout current={current} setCurrent={setCurrent}>
            <Suspense fallback={<LoadingSkeleton variant="card" count={6} showActions={false}/>}>
                <AccountsContent/>
            </Suspense>
        </Layout>
    );
}
