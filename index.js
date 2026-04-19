import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors({
    origin: [
        "https://smart-expense-splitter-gold-sigma.vercel.app",
        "http://localhost:5173"
    ],
}));
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Groups
app.post("/groups", async (req, res) => {
    try {
        const { name } = req.body;
        const { data, error } = await supabase.from("groups").insert([{ name }]).select();
        if (error) throw error;
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/groups", async (req, res) => {
    try {
        const { data, error } = await supabase.from("groups").select("*");
        if (error) throw error;
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Members
app.post("/members", async (req, res) => {
    try {
        const { name, group_id } = req.body;
        const { data, error } = await supabase.from("members").insert([{ name, group_id }]);
        if (error) throw error;
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/members/:groupId", async (req, res) => {
    try {
        const { groupId } = req.params;
        const { data, error } = await supabase.from("members").select("*").eq("group_id", groupId);
        if (error) throw error;
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Expenses
app.post("/expenses", async (req, res) => {
    try {
        const { group_id, amount, paid_by } = req.body;

        const { data: members } = await supabase.from("members").select("*").eq("group_id", group_id);

        const split = amount / members.length;

        let balances = {};

        members.forEach((m) => {
            balances[m.name] = m.name === paid_by ? amount - split : -split;
        });

        const { data, error } = await supabase.from("expensess").insert([
            { group_id, amount, paid_by, balances },
        ]);

        if (error) throw error;

        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/expenses/:groupId", async (req, res) => {
    try {
        const { groupId } = req.params;
        const { data, error } = await supabase.from("expensess").select("*").eq("group_id", groupId);
        if (error) throw error;
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(5000, () => console.log("Server running"));
