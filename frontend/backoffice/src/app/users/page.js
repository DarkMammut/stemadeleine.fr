"use client";

import {Suspense, useState} from "react";
import Layout from "@/components/ui/Layout";
import Users from "@/scenes/Users";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

function UsersContent() {
    return <Users/>;
}

export default function UsersPage() {
    const [current, setCurrent] = useState("users");

    return (
        <Layout current={current} setCurrent={setCurrent}>
            <Suspense fallback={<LoadingSkeleton variant="card" count={6} showActions={false}/>}>
                <UsersContent/>
            </Suspense>
        </Layout>
    );
}
