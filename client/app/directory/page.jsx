"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function DirectoryPage() {
  const router = useRouter();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, organization, individual
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchNGOs();
  }, []);

  const fetchNGOs = async () => {
    try {
      const { data } = await axios.get("/users/ngos");
      // Filter only verified NGOs
      const verifiedNGOs = data.filter(ngo => ngo.ngoDetails?.verificationStatus === "verified");
      setNgos(verifiedNGOs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching NGOs:", error);
      setLoading(false);
    }
  };

  const filteredNGOs = ngos.filter(ngo => {
    // Filter by type
    if (filter === "organization" && ngo.ngoDetails?.ngoType !== "organization") return false;
    if (filter === "individual" && ngo.ngoDetails?.ngoType !== "individual") return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = ngo.name?.toLowerCase() || "";
      const city = ngo.ngoDetails?.city?.toLowerCase() || "";
      const state = ngo.ngoDetails?.state?