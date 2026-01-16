"use client";

import {Suspense, useState} from "react";
import Layout from "@/components/ui/Layout";
import Payments from "@/scenes/Payments";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

function PaymentsContent() {
    return <Payments/>;
}

export default function UsersPage() {
    const [current, setCurrent] = useState("payments");

    return (
        <Layout current={current} setCurrent={setCurrent}>
            <Suspense fallback={<LoadingSkeleton variant="card" count={6} showActions={false}/>}>
                <PaymentsContent/>
            </Suspense>
        </Layout>
    );
}
