"use client";

import {Suspense, useState} from "react";
import Layout from "@/components/ui/Layout";
import News from "@/scenes/News";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

function NewsContent() {
    return <News/>;
}

export default function PagesPage() {
    const [current, setCurrent] = useState("news");

    return (
        <Layout current={current} setCurrent={setCurrent}>
            <Suspense fallback={<LoadingSkeleton variant="card" count={6} showActions={false}/>}>
                <NewsContent/>
            </Suspense>
        </Layout>
    );
}
