"use client";

import {Suspense, useState} from "react";
import Layout from "@/components/ui/Layout";
import Newsletters from "@/scenes/Newsletters";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

function NewslettersContent() {
    return <Newsletters/>;
}

export default function PagesPage() {
    const [current, setCurrent] = useState("newsletters");

    return (
        <Layout current={current} setCurrent={setCurrent}>
            <Suspense fallback={<LoadingSkeleton variant="card" count={6} showActions={false}/>}>
                <NewslettersContent/>
            </Suspense>
        </Layout>
    );
}
