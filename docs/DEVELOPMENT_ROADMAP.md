# Self-Care App - Development Roadmap

## Current Status (Phases 1-3 Complete)

✅ **Phase 1-3: MVP Foundation**
- Authentication (login, signup, protected routes)
- Goals System (CRUD, completion, currency earning, streaks)
- Reflections System (writing, prompts, word count → currency)
- Rewards System (create, track progress, purchase)
- Basic UI (5-tab navigation, header, currency display)
- Database schema with RLS
- Design system defined

---

## Phase 4: Polish & Fill Core Gaps

**Timeline:** 2 weeks
**Priority:** High - Fixes critical bugs and completes core user flows

### 4.1 - Me Page Functionality (Week 1)

**Goal History View**
- Create `app/(protected)/me/goals/page.tsx`
- Calendar view showing completed goals by date
- Filter by date range, difficulty
- Total currency earned from goals
- Export option (optional)

**Reflection Archive**
- Create `app/(protected)/me/reflections/page.tsx`
- List view of past reflections with search/filter
- Display word count and currency earned per entry
- Click to read full reflection
- Search by content (optional)

**Settings Page**
- Create `app/(protected)/me/settings/page.tsx`
- Display name editing
- Notification preferences toggle (when notifications implemented)
- Timezone display (readonly for now)
- Account deletion option (with confirmation)
- Theme selection (future: matcha vs other palettes)

### 4.2 - Error Handling & Polish (Week 1-2)

**Error Boundaries**
- Create `app/error.tsx` (root error boundary)
- Create `app/(protected)/error.tsx` (protected routes error boundary)
- User-friendly error messages with retry/home buttons
- Log errors to console for debugging

**Loading States**
- Add `loading.tsx` files for all major routes:
  - `app/(protected)/home/loading.tsx`
  - `app/(protected)/goals/loading.tsx`
  - `app/(protected)/reflect/loading.tsx`
  - `app/(protected)/rewards/loading.tsx`
  - `app/(protected)/me/loading.tsx`
- Create skeleton loaders for goal cards, reflection list, reward cards
- Proper loading indicators on form submissions (disabled state + spinner)

**404 Page**
- Create `app/not-found.tsx`
- Friendly "page not found" message
- Navigation back to home
- Match design system aesthetics

**Fix Currency Transaction Integrity Bug** ⚠️ CRITICAL
- **Problem:** Reward purchase uses two separate DB operations (insert transaction + update reward)
- **Issue:** If second operation fails, user loses currency without getting reward
- **Solution:** Create Supabase RPC (stored procedure) for atomic reward purchase
- File: `supabase/migrations/20260204_reward_purchase_rpc.sql`
```sql
CREATE OR REPLACE FUNCTION purchase_reward(
  p_user_id UUID,
  p_reward_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_balance DECIMAL(10,2);
  v_price DECIMAL(10,2);
  v_reward_name TEXT;
BEGIN
  -- Get current balance
  SELECT COALESCE(SUM(amount), 0) INTO v_balance
  FROM currency_transactions
  WHERE user_id = p_user_id;
  
  -- Get reward details
  SELECT price, name INTO v_price, v_reward_name
  FROM rewards
  WHERE id = p_reward_id AND user_id = p_user_id AND purchased_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward not found or already purchased';
  END IF;
  
  IF v_balance < v_price THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Atomic transaction
  INSERT INTO currency_transactions (user_id, amount, transaction_type, reference_id, description)
  VALUES (p_user_id, -v_price, 'reward_unlock', p_reward_id, 'Purchased: ' || v_reward_name);
  
  UPDATE rewards
  SET purchased_at = NOW(), is_active = false
  WHERE id = p_reward_id;
  
  RETURN json_build_object('success', true, 'balance', v_balance - v_price);
END;
$$ LANGUAGE plpgsql;
```
- Update `app/(protected)/rewards/actions.ts` to use RPC instead

### 4.3 - Mood Tracking Enhancement (Week 2)

**Mood History View**
- Create `app/(protected)/me/moods/page.tsx`
- Timeline/list of past mood entries
- Filter by date range
- Emoji display with optional description
- Count moods per day/week for patterns
- Simple visualization (optional bar chart)

**Mood Summary Stats**
- Most common mood this week/month
- Mood streaks (e.g., "3 days of happy moods!")
- Integration point for future monthly summaries

---

## Phase 5: Cat System (Post-MVP Tier 2)

**Timeline:** 2 weeks
**Priority:** High - Core gamification incentive

### 5.1 - Basic Cat Interaction (Week 3)

**Database Schema Extensions**
```sql
-- Already exists: cat_state table
-- Add new tables:

CREATE TABLE cat_accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'hat', 'clothes', 'accessory'
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT, -- Path to asset
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cat_furniture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'background', 'floor', 'decoration'
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_cat_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- 'accessory' or 'furniture'
  item_id UUID NOT NULL, -- References cat_accessories or cat_furniture
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

CREATE TABLE cat_appearance (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  equipped_accessories JSONB DEFAULT '[]'::jsonb, -- Array of accessory IDs
  equipped_furniture JSONB DEFAULT '[]'::jsonb, -- Array of furniture IDs
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Cat Health System**
- Implement Fibonacci health decay:
  - Day 0 unfed: -0 health
  - Day 1 unfed: -1 health
  - Day 2 unfed: -1 health
  - Day 3 unfed: -2 health
  - Day 4 unfed: -3 health
  - Day 5 unfed: -5 health
  - Continues Fibonacci sequence
  - Minimum health: 1 (never dies)
- Create utility function: `lib/cat-health.ts`
  - `calculateHealthDecay(lastFedDate, currentDate): number`
  - `getDaysUnfed(lastFedDate, currentDate): number`

**Cat Feeding Functionality**
- Create `app/(protected)/cat/page.tsx` (accessed by tapping floating cat)
- Create `app/(protected)/cat/actions.ts`:
  - `feedCat(userId)` - Deducts food cost, updates `last_fed_date`, restores health to 100
- Cat food cost: **$0.50** (50 cents) - TBD, can adjust
- Visual health indicator (health bar or percentage)
- Feed button prominent when health < 100
- Success message on feed

**Floating Cat Component Enhancement**
- Update `components/cat/floating-cat.tsx` (create if doesn't exist)
- Show health indicator badge on floating cat
- Different cat expressions based on health:
  - 100-80%: Happy cat
  - 79-50%: Neutral cat
  - 49-20%: Sad cat
  - 19-1%: Very sad cat
- Pulsing animation when health < 50% (needs feeding)

**Cat Modal UI**
- Full-screen overlay when cat is tapped
- Large cat display (center)
- Health bar below cat
- Feed button (disabled if already fed today or insufficient balance)
- Currency balance visible
- "Last fed: X hours ago" timestamp
- Close button to return

### 5.2 - Cat Customization (Week 3-4)

**Cat Shop Interface**
- Create `app/(protected)/cat/shop/page.tsx`
- Tabs for Accessories and Furniture
- Grid layout showing available items
- Show price, owned status
- Purchase button (deducts currency, adds to `user_cat_items`)
- Filter: All / Owned / Not Owned

**Cat Customization Screen**
- Create `app/(protected)/cat/customize/page.tsx`
- Display cat with current equipped items
- List of owned accessories and furniture
- Equip/unequip buttons
- Save equipped items to `cat_appearance` table

**Cat Rendering System**
- Option 1: Static images with CSS layering
  - Base cat image
  - Overlay accessory images as layers
  - Position via CSS absolute positioning
- Option 2: SVG-based system
  - Cat as SVG with modifiable parts
  - Accessories as SVG components
- Option 3: Use existing cat avatar generator library
  - DiceBear API (free tier)
  - Cats as Code (if available)

**Seed Initial Cat Items**
- Create migration: `supabase/migrations/20260205_seed_cat_items.sql`
- Add 5-10 accessories (free and paid)
- Add 3-5 furniture items
- Examples:
  - Free: Basic collar, ball toy
  - Paid: Wizard hat ($2.00), Bow tie ($1.50), Sunglasses ($2.50)
  - Furniture: Scratching post ($3.00), Cat tower ($5.00), Window perch ($4.00)

---

## Phase 6: Bundles System

**Timeline:** 1-2 weeks
**Priority:** Medium - Adds variety and bonus rewards

### 6.1 - Bundle Infrastructure (Week 4-5)

**Database Schema**
```sql
CREATE TYPE bundle_type AS ENUM ('daily', 'weekly', 'challenge');

CREATE TABLE bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  bundle_type bundle_type NOT NULL,
  bonus_currency DECIMAL(10,2) NOT NULL,
  time_limit_days INTEGER, -- NULL for no limit
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  goal_template_title TEXT NOT NULL, -- e.g., "Take a shower"
  goal_template_difficulty difficulty_level NOT NULL,
  position INTEGER NOT NULL, -- Order in bundle
  UNIQUE(bundle_id, position)
);

CREATE TABLE user_bundle_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- For time-limited bundles
  completed_items JSONB DEFAULT '[]'::jsonb, -- Array of goal_completion IDs
  UNIQUE(user_id, bundle_id, started_at::date) -- One instance per bundle per day
);

CREATE INDEX idx_bundle_progress_user ON user_bundle_progress(user_id);
CREATE INDEX idx_bundle_progress_active ON user_bundle_progress(user_id, completed_at) 
  WHERE completed_at IS NULL;
```

**Bundle Creation (Admin/Developer)**
- Create `scripts/create-bundle.ts` (run via `npm run create-bundle`)
- Or admin UI: `app/(protected)/admin/bundles/page.tsx` (protected by email check)
- Define bundle with:
  - Name, description, type
  - List of goal templates
  - Bonus currency amount
  - Optional time limit

**Example Bundles**
```typescript
// Daily Bundles
{
  name: "Morning Routine",
  type: "daily",
  items: ["Brush teeth", "Drink water", "Make bed"],
  bonus: 0.50
}

{
  name: "Hygiene Bundle",
  type: "daily",
  items: ["Shower", "Skincare routine", "Brush teeth", "Floss"],
  bonus: 0.75
}

// Weekly Bundles
{
  name: "Wellness Week",
  type: "weekly",
  items: ["Exercise 3x", "Meal prep", "Clean room", "Call a friend"],
  bonus: 2.00
}

// Challenge Bundles
{
  name: "Librarian Challenge",
  type: "challenge",
  timeLimitDays: 7,
  items: ["Read 100 pages", "Write book reflection", "Visit library"],
  bonus: 3.00
}
```

**Bundle Detection Logic**
- Create `lib/bundles.ts`:
  - `detectBundleCompletion(userId, bundleId)` - Check if all items complete
  - `awardBundleBonus(userId, bundleId)` - Insert currency transaction, mark complete
- Run after each goal completion in `completeGoal` action
- Only award bonus once per bundle instance

**Bundle UI Components**
- `components/bundles/bundle-card.tsx` - Progress card on home screen
- Shows: Bundle name, X/Y items complete, progress bar, bonus amount
- Click to expand and see individual items
- Celebration animation on completion

**Seed Initial Bundles**
- Create migration: `supabase/migrations/20260206_seed_bundles.sql`
- Add 2-3 daily bundles
- Add 1-2 weekly bundles
- Add 1 challenge bundle

---

## Phase 7: Advanced Features

**Timeline:** 3-4 weeks
**Priority:** Low-Medium - Nice to have, not critical

### 7.1 - Blind Boxes (Week 6)

**Database Schema**
```sql
CREATE TABLE blind_box_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_type TEXT NOT NULL, -- 'spotify_song', 'cat_item', 'currency_bonus'
  reward_data JSONB NOT NULL, -- Song details, item ID, or amount
  rarity TEXT NOT NULL, -- 'common', 'rare', 'legendary'
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE user_blind_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES blind_box_rewards(id),
  trigger_type TEXT NOT NULL, -- 'bundle_complete', 'streak_milestone'
  trigger_reference_id UUID,
  opened_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Trigger Conditions**
- Bundle completion
- Streak milestones (30 days, 60 days, 90 days)
- Manual admin grant (for special occasions)

**Reward Types**
1. **Spotify Song Recommendation**
   - Curated list of songs
   - Display with album art, artist, play link
2. **Cat Item**
   - Free accessory or furniture
   - Automatically added to inventory
3. **Currency Bonus**
   - Random amount: $1-5
   - Insert transaction

**Opening UI**
- Full-screen modal
- "You got a blind box!" notification
- Tap to open animation
- Reveal reward with celebration
- Add to collection view

### 7.2 - Monthly Summaries (Week 7)

**Database Schema**
```sql
CREATE TABLE monthly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- First day of month
  summary_text TEXT NOT NULL, -- AI-generated insights
  mood_data JSONB, -- Aggregated mood stats
  goal_data JSONB, -- Aggregated goal stats
  reflection_data JSONB, -- Themes from reflections
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);
```

**Data Aggregation**
- Create `lib/monthly-summary.ts`:
  - `generateMonthlySummary(userId, month)` - Aggregate data from mood, goals, reflections
  - Call OpenAI/Claude API with prompt:
    - "Generate compassionate insights from this user's self-care data..."
    - Emphasize patterns, not pressure
    - Use encouraging, gentle language
  - Cache result in database

**Cron Job / Manual Trigger**
- Run on 1st of each month
- Or: User can manually request summary for any past month
- Display in `app/(protected)/me/summaries/page.tsx`

**Example Summary Format**
```
This month, you completed 45 goals and wrote 12 reflections. 

You tend to feel most energized in the mornings - 8 of your 10 "happy" 
mood check-ins were before noon. 

You've been consistent with your hygiene goals, completing the bundle 
18 out of 30 days. Nothing else is required - that's wonderful progress.

Your reflections often mention rest and boundaries. It might be a good 
moment to honor that need.
```

### 7.3 - Notifications (Week 8)

**PWA Push Notifications**
- Request notification permission on first login
- Store permission status in `user_preferences` table (create if needed)
- Use Web Push API or service like OneSignal

**Notification Types**
1. **Goal Reminders**
   - Scheduled based on `goals.scheduled_time`
   - "Time to [goal title]!"
   - Only for goals with reminders enabled
2. **Mood Check-in Reminders**
   - 3x daily: Morning (9 AM), Afternoon (2 PM), Evening (8 PM)
   - Configurable times in settings
   - "How are you feeling right now?"
3. **Cat Feeding Reminder**
   - Daily at user's preferred time (default: 8 PM)
   - "Your cat needs feeding! Health: 75%"
   - Only if not fed today
4. **Streak Maintenance**
   - If no goals completed today and it's 8 PM
   - "Keep your streak alive! Complete a goal today."
5. **Reward Milestone**
   - "You're $1.50 away from your Coffee reward!"
   - When within $2 of active reward goal

**Implementation**
- Server-side: Cron jobs or scheduled functions (Supabase Edge Functions)
- Client-side: Service Worker for receiving push
- Settings page: Toggle each notification type on/off

### 7.4 - Spotify Integration (Week 9)

**OAuth Setup**
- Register app with Spotify Developer Dashboard
- Implement OAuth flow: `app/api/spotify/auth/route.ts`
- Store access/refresh tokens in `user_integrations` table (create)

**Data Collection**
- Fetch recently played tracks (daily)
- Store in `spotify_listening_history` table
- Track: song, artist, genre, timestamp, duration

**Mood Correlation**
- Create `lib/spotify-insights.ts`:
  - `analyzeMoodMusicCorrelation(userId, dateRange)`
  - Map genres/tempos to mood entries
  - Find patterns (e.g., "You listen to sad songs on anxious days")

**Integration Points**
1. **Monthly Summaries**
   - Include listening habits
   - "You listened to 45 hours of music this month, mostly indie folk."
2. **Blind Box Rewards**
   - Recommend songs based on listening history
   - "We think you'll like this song based on your taste"

---

## Phase 8: Production Readiness

**Timeline:** 1-2 weeks
**Priority:** High before public launch

### 8.1 - Testing

**Unit Tests** (optional for MVP, good for stability)
- Test currency calculations
- Test streak logic
- Test date/timezone handling
- Tool: Vitest or Jest

**Integration Tests**
- Test goal completion flow
- Test reflection saving
- Test reward purchase (especially with new RPC)
- Tool: Playwright or Cypress

**Manual Testing Checklist**
- [ ] Sign up new account
- [ ] Create goals of each type
- [ ] Complete goals, verify currency
- [ ] Write reflections, verify currency
- [ ] Purchase reward, verify transaction
- [ ] Feed cat (when implemented)
- [ ] Bundle completion
- [ ] Streak tracking
- [ ] All Me page views work

### 8.2 - Performance Optimization

**Database**
- Add missing indexes if queries are slow
- Consider materialized view for currency balance (if needed)
- Pagination for goal/reflection lists (if user has 100+)

**Frontend**
- Lazy load images (cat assets, reward icons)
- Code splitting for rarely used pages
- Optimize bundle size

**Caching**
- Cache currency balance for 5 minutes (if query is slow)
- Cache reflection prompts (static data)
- Use Next.js built-in caching effectively

### 8.3 - Security Audit

**Review RLS Policies**
- Ensure all tables have proper policies
- Test with multiple users
- Verify no data leakage

**Input Validation**
- Sanitize all user inputs (goal titles, reflection content)
- Prevent XSS attacks
- Validate currency amounts server-side

**Rate Limiting**
- Prevent goal spam (max 50 goals/day?)
- Prevent reflection spam (max 20 reflections/day?)
- Use Supabase Edge Functions with rate limiting

### 8.4 - PWA Optimization

**Manifest**
- Update `manifest.json` with proper app name, icons
- Set display mode: "standalone"
- Define theme colors from design system

**Service Worker**
- Cache static assets
- Offline fallback page
- Background sync for failed actions (optional)

**iOS Safari Specific**
- Add apple-touch-icon
- Add apple-mobile-web-app-capable meta tag
- Test "Add to Home Screen" flow

**Push Notifications**
- Web Push API setup
- Request permission flow
- Handle permission denial gracefully

---

## Phase 9: Future Enhancements (Backlog)

**Not Prioritized - Consider After Everything Else**

### 9.1 - User-Created Bundles
- Allow users to create custom bundles from their goals
- Template system
- Share bundles between users (couples feature?)

### 9.2 - Shared/Couples Features
- Shared goals or challenges
- Send encouragement/gifts
- Shared pet or separate pets
- Friend system

### 9.3 - Advanced Cat Features
- Multiple cats or pet types
- Cat personality development
- Cat activities/mini-games
- Cat growth stages (kitten → adult → senior)

### 9.4 - Multiple Themes
- Implement other color palettes (ocean, sunset, lavender, forest)
- Theme switcher in settings
- Save user preference

### 9.5 - Data Export
- Export reflections as PDF or markdown
- Export goal history as CSV
- Backup entire account data

### 9.6 - Gamification Enhancements
- Achievement badges
- Leaderboard (if multiple users)
- Seasonal events
- Limited-time challenges

---

## Recommended Immediate Actions

### This Week (Week 1)
1. **Fix currency transaction integrity bug** ⚠️ CRITICAL
   - Create RPC for atomic reward purchase
   - Update reward actions to use RPC
   - Test thoroughly

2. **Implement Me page views**
   - Goal history (calendar/list view)
   - Reflection archive (list with search)
   - Settings page (basic fields)

3. **Add loading states**
   - Create `loading.tsx` for all routes
   - Add skeleton loaders
   - Form submission loading indicators

### Next Week (Week 2)
4. **Error boundaries**
   - Root error boundary
   - Protected route error boundary
   - 404 page

5. **Mood history view**
   - Display past mood logs
   - Simple stats

### Week 3 (Phase 5)
6. **Cat feeding system**
   - Health decay calculation
   - Feed button functionality
   - Cat modal UI
   - Floating cat health indicator

### Week 4 (Phase 5 continued)
7. **Cat customization**
   - Shop interface
   - Accessory/furniture purchase
   - Equip items system
   - Seed initial items

---

## Success Metrics

**For MVP Launch (Girlfriend Using Daily):**
- [ ] No critical bugs blocking daily use
- [ ] All core flows work smoothly (create goal → complete → earn → spend)
- [ ] Cat system is engaging and rewarding
- [ ] UI is clean and uncluttered (better than Finch)
- [ ] Fast access to all features (1-2 taps max)
- [ ] No data loss or corruption

**For Phase 2 (Full Feature Set):**
- [ ] Bundles provide variety and bonus motivation
- [ ] Monthly summaries provide valuable insights
- [ ] Notifications keep engagement without being annoying
- [ ] App feels polished and complete

---

## Notes

- **Flexibility:** This roadmap is a guide, not a contract. Adjust based on feedback and priorities.
- **User Feedback:** Get girlfriend's feedback after each phase. What's working? What's frustrating?
- **Incremental Deployment:** Deploy early and often. Fix issues as they arise.
- **Don't Overengineer:** Start simple, add complexity only when needed.
- **Have Fun:** This is a gift for your girlfriend. Keep it enjoyable to build.
