"use client";

import {Suspense, useState} from "react";
import Layout from "@/components/ui/Layout";
import Contacts from "@/scenes/Contacts";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

function ContactsContent() {
    return <Contacts/>;
}

export default function ContactsPage() {
    const [current, setCurrent] = useState("contacts");

    return (
        <Layout current={current} setCurrent={setCurrent}>
            <Suspense fallback={<LoadingSkeleton variant="card" count={6} showActions={false}/>}>
                <ContactsContent/>
            </Suspense>
        </Layout>
    );
}
