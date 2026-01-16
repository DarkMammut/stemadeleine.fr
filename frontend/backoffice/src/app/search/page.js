"use client";

import {Suspense} from "react";
import Layout from "@/components/ui/Layout";
import Search from "@/scenes/Search";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

function SearchContent() {
    return <Search/>;
}

export default function SearchPage() {
    return (
        <Layout>
            <Suspense fallback={<LoadingSkeleton variant="card" count={3} showActions={false}/>}>
                <SearchContent/>
            </Suspense>
        </Layout>
    );
}
