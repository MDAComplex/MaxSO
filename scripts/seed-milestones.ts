#!/usr/bin/env ts-node
/**
 * Seed milestones into Supabase using the service-role key (bypasses RLS).
 * Run with: npm run seed:milestones
 *
 * Required in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 *   SEED_USER_ID=your-user-uuid
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const userId = process.env.SEED_USER_ID

if (!url || !serviceKey || !userId) {
  console.error('Missing env vars. Add to .env.local:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL')
  console.error('  SUPABASE_SERVICE_ROLE_KEY')
  console.error('  SEED_USER_ID')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
})

const MILESTONES = [
  { key: 'p2_ende',             label: 'P2 Ende — Schul-QV + BM Warmup',          category: 'phase',    scenario: null, target_date: '2026-06-30', phase_start: '2026-06-02', confidence: 'fixed',    note: 'QV komplett (HKB A, 09.06.)', sort_order: 10 },
  { key: 'p3_start',            label: 'P3 Start — BM Foundation',                 category: 'phase',    scenario: null, target_date: '2026-07-01', phase_start: '2026-06-30', confidence: 'fixed',    note: null, sort_order: 20 },
  { key: 'p3_checkpoint',       label: 'P3 Checkpoint',                             category: 'phase',    scenario: null, target_date: '2026-07-31', phase_start: '2026-07-01', confidence: 'fixed',    note: 'Looksmaxxing & Lern-Review', sort_order: 30 },
  { key: 'p4_start',            label: 'P4 Start — BM Launch Ready',               category: 'phase',    scenario: null, target_date: '2026-08-01', phase_start: '2026-07-31', confidence: 'fixed',    note: null, sort_order: 40 },
  { key: 'bm_start',            label: 'BM Start',                                  category: 'bm',       scenario: null, target_date: '2026-08-17', phase_start: '2026-08-01', confidence: 'fixed',    note: 'BM2 Vollzeit = 1 Jahr', sort_order: 50 },
  { key: 'bm_hs_ende',          label: 'BM Herbstsemester Ende',                    category: 'bm',       scenario: null, target_date: '2027-01-29', phase_start: '2026-08-17', confidence: 'estimate', note: 'CH-Schulkalender, anpassen sobald Stundenplan da', sort_order: 60 },
  { key: 'bm_fs_start',         label: 'BM Frühlingssemester Start',                category: 'bm',       scenario: null, target_date: '2027-02-16', phase_start: '2027-01-29', confidence: 'estimate', note: null, sort_order: 70 },
  { key: 'bm_pruefungen',       label: 'BM Abschlussprüfungen',                     category: 'bm',       scenario: null, target_date: '2027-06-14', phase_start: '2027-02-16', confidence: 'estimate', note: 'i.d.R. Juni', sort_order: 80 },
  { key: 'bm_abschluss',        label: 'BM Abschluss',                              category: 'bm',       scenario: null, target_date: '2027-07-09', phase_start: '2027-06-14', confidence: 'estimate', note: 'Ziel-Linie BM ✓', sort_order: 90 },
  { key: 'fh_frist',            label: 'FH Anmeldefrist',                           category: 'fh',       scenario: 'A',  target_date: '2027-04-30', phase_start: '2027-01-01', confidence: 'estimate', note: 'Variiert je FH — prüfen', sort_order: 100 },
  { key: 'fh_start',            label: 'FH Bachelor Start',                         category: 'fh',       scenario: 'A',  target_date: '2027-09-20', phase_start: '2027-07-09', confidence: 'estimate', note: 'FH HS ~KW 38', sort_order: 110 },
  { key: 'fh_abschluss',        label: 'FH Bachelor fertig (3 Jahre)',              category: 'fh',       scenario: 'A',  target_date: '2030-07-01', phase_start: '2027-09-20', confidence: 'estimate', note: '6 Semester Vollzeit', sort_order: 120 },
  { key: 'yonsei_after_fh',     label: 'Yonsei Master / Exchange',                  category: 'yonsei',   scenario: 'A',  target_date: '2030-09-01', phase_start: '2030-07-01', confidence: 'estimate', note: 'Herbst 2030 o. Frühling 2031', sort_order: 130 },
  { key: 'yonsei_b_frist_fall', label: 'Yonsei Fall-2027 Frist (aggressiv)',        category: 'yonsei',   scenario: 'B',  target_date: '2027-04-30', phase_start: '2027-01-01', confidence: 'estimate', note: 'BM noch nicht fertig = riskant', sort_order: 140 },
  { key: 'yonsei_b_frist_spr',  label: 'Yonsei Spring-2028 Frist (realistisch)',    category: 'yonsei',   scenario: 'B',  target_date: '2027-11-15', phase_start: '2027-07-09', confidence: 'estimate', note: '1. Runde ~Sept, 2. Runde ~Nov', sort_order: 150 },
  { key: 'yonsei_b_start',      label: 'Yonsei Bachelor Start (Spring 2028)',       category: 'yonsei',   scenario: 'B',  target_date: '2028-03-02', phase_start: '2027-11-15', confidence: 'estimate', note: 'TOPIK Pflicht!', sort_order: 160 },
  { key: 'yonsei_b_abschluss',  label: 'Yonsei Bachelor fertig (4 Jahre)',          category: 'yonsei',   scenario: 'B',  target_date: '2032-02-15', phase_start: '2028-03-02', confidence: 'estimate', note: null, sort_order: 170 },
  { key: 'exchange_apply',      label: 'Bewerbung Austausch Yonsei',                category: 'exchange', scenario: 'C',  target_date: '2029-03-01', phase_start: '2028-09-01', confidence: 'estimate', note: 'i.d.R. ~1 Jahr vorher, im 3. FH-Jahr', sort_order: 180 },
  { key: 'exchange_start',      label: 'Austausch Start — Yonsei Fall',             category: 'exchange', scenario: 'C',  target_date: '2029-08-25', phase_start: '2029-03-01', confidence: 'estimate', note: null, sort_order: 190 },
  { key: 'exchange_ende',       label: 'Austausch Ende — zurück FH',                category: 'exchange', scenario: 'C',  target_date: '2030-06-20', phase_start: '2029-08-25', confidence: 'estimate', note: null, sort_order: 200 },
]

async function createTableIfNeeded() {
  // Try inserting a dummy check — if table missing, create it via RPC
  const { error } = await supabase.from('milestones').select('id').limit(1)
  if (!error) return // table exists

  console.log('Creating milestones table...')
  const { error: rpcError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS milestones (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        key text NOT NULL,
        label text NOT NULL,
        category text NOT NULL,
        scenario text,
        target_date date NOT NULL,
        phase_start date,
        confidence text NOT NULL DEFAULT 'estimate',
        note text,
        sort_order int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(user_id, key)
      );
      ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "owner" ON milestones FOR ALL USING (auth.uid() = user_id);
    `,
  })

  if (rpcError) {
    console.error('Could not auto-create table via RPC. Please run the SQL in supabase/migrations.sql manually once.')
    console.error(rpcError.message)
    process.exit(1)
  }
}

async function main() {
  console.log(`Seeding ${MILESTONES.length} milestones for user ${userId}...`)

  await createTableIfNeeded()

  const rows = MILESTONES.map((m) => ({ ...m, user_id: userId }))

  const { error } = await supabase
    .from('milestones')
    .upsert(rows, { onConflict: 'user_id,key' })

  if (error) {
    console.error('Upsert failed:', error.message)
    process.exit(1)
  }

  console.log(`Done! ${MILESTONES.length} milestones upserted.`)
}

main()
