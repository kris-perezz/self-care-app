import React, { useState } from 'react';
import { Home, Target, PenTool, Award, User, Plus, Trash2, Edit3, Calendar, TrendingUp, Heart, Shuffle } from 'lucide-react';

const SelfCareAppMockupV6 = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showCat, setShowCat] = useState(false);

  const todaysGoals = [
    { id: 1, title: 'Morning meditation', difficulty: 'easy', value: 0.25, completed: false, time: '8:00 AM' },
    { id: 2, title: 'Journal 3 pages', difficulty: 'medium', value: 0.50, completed: true, time: '9:30 AM' },
    { id: 3, title: 'Workout session', difficulty: 'hard', value: 1.00, completed: false, time: '6:00 PM' },
    { id: 4, title: 'Skincare routine', difficulty: 'easy', value: 0.25, completed: false, time: '10:00 PM' },
  ];

  const bundles = [
    { name: 'Hygiene Bundle', items: 3, completed: 1, bonus: 0.50 },
    { name: 'Wellness Bundle', items: 7, completed: 4, bonus: 2.00 },
  ];

  const completedToday = todaysGoals.filter(g => g.completed).length;
  const totalToday = todaysGoals.length;

  const FloatingCat = () => (
    <button
      onClick={() => setShowCat(true)}
      className="fixed top-6 right-6 z-40 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform border-2 border-white"
      style={{ backgroundImage: 'linear-gradient(to bottom right, #ffc4eb, #ffe4fa)' }}
    >
      🐱
      <div className="absolute -top-1 -right-1 w-4 h-4 border-2 border-white rounded-full" style={{ backgroundColor: '#abc798' }}></div>
    </button>
  );

  const NavBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200">
      <div className="flex justify-around items-center px-6 py-3 max-w-md mx-auto">
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'goals', icon: Target, label: 'Goals' },
          { id: 'reflect', icon: PenTool, label: 'Reflect' },
          { id: 'rewards', icon: Award, label: 'Rewards' },
          { id: 'me', icon: User, label: 'Me' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all`}
            style={activeTab === tab.id ? { backgroundColor: 'rgba(171, 199, 152, 0.2)', color: '#7a9970' } : { color: '#6b7280' }}
          >
            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const HomeScreen = () => (
    <div className="pb-28 px-6 pt-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Today</h1>
        <p className="text-gray-500 text-sm mt-1">Sunday, Feb 1</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="rounded-2xl p-4 border" style={{ backgroundImage: 'linear-gradient(to bottom right, #ffc4eb, #ffe4fa)', borderColor: 'rgba(255, 196, 235, 0.4)' }}>
          <div className="text-3xl font-bold text-gray-900">$4.50</div>
          <div className="text-xs text-gray-700 mt-1 font-medium">Balance</div>
        </div>
        <div className="rounded-2xl p-4 border" style={{ backgroundImage: 'linear-gradient(to bottom right, rgba(171, 199, 152, 0.6), rgba(171, 199, 152, 0.8))', borderColor: '#abc798' }}>
          <div className="text-3xl font-bold text-gray-900">12</div>
          <div className="text-xs text-gray-700 mt-1 font-medium">Day streak</div>
        </div>
        <div className="rounded-2xl p-4 border" style={{ backgroundImage: 'linear-gradient(to bottom right, #e1dabd, #f1dedc)', borderColor: '#e1dabd' }}>
          <div className="text-3xl font-bold text-gray-900">{completedToday}/{totalToday}</div>
          <div className="text-xs text-gray-700 mt-1 font-medium">Today's goals</div>
        </div>
      </div>

      <div className="rounded-2xl p-5 mb-6 border" style={{ backgroundImage: 'linear-gradient(to right, #ffc4eb, #ffe4fa)', borderColor: 'rgba(255, 196, 235, 0.4)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
              ☕
            </div>
            <div>
              <div className="font-semibold text-gray-900">Coffee treat</div>
              <div className="text-sm text-gray-700">$2.50 to go</div>
            </div>
          </div>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
          <div className="h-full bg-gray-900 rounded-full transition-all" style={{ width: '64%' }}></div>
        </div>
        <div className="mt-2 text-xs text-gray-700">$4.50 / $7.00</div>
      </div>

      <button
        onClick={() => setActiveTab('reflect')}
        className="w-full py-4 rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition-all mb-8 text-white"
        style={{ backgroundColor: '#abc798' }}
      >
        Reflect Now
      </button>

      <div className="space-y-3 mb-6">
        {bundles.map((bundle, i) => (
          <div key={i} className="rounded-2xl p-4 border shadow-sm" style={{
            backgroundImage: i === 0 ? 'linear-gradient(to right, #ffe4fa, #f1dedc)' : 'linear-gradient(to right, #f1dedc, #e1dabd)',
            borderColor: i === 0 ? '#ffe4fa' : '#f1dedc'
          }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-bold text-gray-900">{bundle.name}</div>
                <div className="text-xs text-gray-700">{bundle.completed}/{bundle.items} complete</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600">Bonus</div>
                <div className="font-bold text-gray-900 text-sm">${bundle.bonus.toFixed(2)}</div>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
              <div className="h-full bg-gray-900 rounded-full transition-all" style={{ width: `${(bundle.completed / bundle.items) * 100}%` }}></div>
            </div>
            <div className="mt-1 text-xs text-gray-700">{bundle.items - bundle.completed} tasks remaining</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Goals</h2>
        <button onClick={() => setActiveTab('goals')} className="font-medium text-sm" style={{ color: '#7a9970' }}>View all</button>
      </div>

      <div className="space-y-3">
        {todaysGoals.map(goal => (
          <div
            key={goal.id}
            className={`rounded-2xl p-4 border-2 transition-all ${goal.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-start gap-3">
              <button
                className="mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0"
                style={goal.completed ? { backgroundColor: '#abc798', borderColor: '#abc798' } : { borderColor: '#d1d5db' }}
              >
                {goal.completed && <span className="text-white text-sm">✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm mb-1 ${goal.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {goal.title}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {goal.time && (
                    <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-lg">
                      <Calendar size={11} />
                      {goal.time}
                    </span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={
                    goal.difficulty === 'easy' ? { backgroundColor: 'rgba(171, 199, 152, 0.2)', color: '#7a9970' } :
                    goal.difficulty === 'medium' ? { backgroundColor: '#e1dabd', color: '#4b5563' } :
                    { backgroundColor: 'rgba(255, 196, 235, 0.4)', color: '#111827' }
                  }>
                    ${goal.value.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-gray-400 transition-all flex items-center justify-center gap-2 font-medium">
        <Plus size={20} />
        Add Goal
      </button>
    </div>
  );

  const GoalsScreen = () => (
    <div className="pb-28 px-6 pt-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900">All Goals</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your tasks</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {['Today', 'This week', 'All'].map((filter, i) => (
          <button
            key={filter}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all text-white shadow-md"
            style={i === 0 ? { backgroundColor: '#abc798' } : { backgroundColor: '#e5e7eb', color: '#4b5563' }}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Today • 4 goals</div>
          <div className="space-y-3">
            {todaysGoals.map(goal => (
              <div key={goal.id} className="bg-white rounded-2xl p-4 border-2 border-gray-200 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-2">{goal.title}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-lg">
                        <Calendar size={11} />
                        {goal.time}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={
                        goal.difficulty === 'easy' ? { backgroundColor: 'rgba(171, 199, 152, 0.2)', color: '#7a9970' } :
                        goal.difficulty === 'medium' ? { backgroundColor: '#e1dabd', color: '#4b5563' } :
                        { backgroundColor: 'rgba(255, 196, 235, 0.4)', color: '#111827' }
                      }>
                        {goal.difficulty.toUpperCase()} • ${goal.value.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <Edit3 size={14} className="text-gray-600" />
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(255, 196, 235, 0.3)' }}>
                      <Trash2 size={14} className="text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ReflectScreen = () => (
    <div className="pb-28 px-6 pt-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Reflect</h1>
        <p className="text-gray-500 text-sm mt-1">Take a moment for yourself</p>
      </div>

      <div className="space-y-4 mb-8">
        <button className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all w-full" style={{ backgroundImage: 'linear-gradient(to bottom right, #ffc4eb, #ffe4fa)' }}>
          <div className="relative">
            <div className="text-3xl mb-2">😊</div>
            <div className="text-gray-900 font-bold text-lg mb-1">Mood check-in</div>
            <div className="text-gray-800 text-sm">Quick emotional pulse</div>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button className="group relative overflow-hidden rounded-2xl p-5 text-left transition-all" style={{ backgroundImage: 'linear-gradient(to bottom right, #ffe4fa, #f1dedc)' }}>
            <div className="relative">
              <div className="text-2xl mb-2">💭</div>
              <div className="text-gray-900 font-bold mb-0.5">Prompted</div>
              <div className="text-gray-700 text-xs">Guided writing</div>
            </div>
          </button>

          <button className="group relative overflow-hidden rounded-2xl p-5 text-left transition-all" style={{ backgroundImage: 'linear-gradient(to bottom right, #f1dedc, #e1dabd)' }}>
            <div className="relative">
              <div className="text-2xl mb-2">✍️</div>
              <div className="text-gray-900 font-bold mb-0.5">Free write</div>
              <div className="text-gray-700 text-xs">Your thoughts</div>
            </div>
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Writing prompts</h2>
        <button className="flex items-center gap-2 font-medium text-sm transition-colors" style={{ color: '#7a9970' }}>
          <Shuffle size={16} />
          Shuffle
        </button>
      </div>

      <div className="space-y-3 mb-8">
        {[
          "What brought you joy today?",
          "What's one thing you're proud of?",
          "How does your body feel right now?",
          "What can you let go of tonight?",
        ].map((prompt, i) => (
          <button key={i} className="w-full bg-white rounded-2xl p-4 text-left border-2 border-gray-200 transition-all group">
            <div className="flex items-start justify-between">
              <p className="text-gray-700 font-medium pr-4">{prompt}</p>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#7a9970' }}>→</div>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-4 border" style={{ backgroundImage: 'linear-gradient(to right, #e1dabd, #f1dedc)', borderColor: '#e1dabd' }}>
        <div className="flex items-start gap-3 mb-3">
          <div className="text-xl">📝</div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 mb-1">Keep writing to earn</div>
            <div className="text-sm text-gray-800 mb-2">You've written 234 words today</div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
              <div className="h-full rounded-full" style={{ width: '70%', backgroundColor: '#abc798' }}></div>
            </div>
            <div className="mt-1.5 text-xs text-gray-800">Earned $2.34 today</div>
          </div>
        </div>
      </div>
    </div>
  );

  const RewardsScreen = () => (
    <div className="pb-28 px-6 pt-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Rewards</h1>
        <p className="text-gray-500 text-sm mt-1">You've earned it</p>
      </div>

      <div className="rounded-2xl p-5 mb-3 border" style={{ backgroundImage: 'linear-gradient(to right, #ffc4eb, #ffe4fa)', borderColor: 'rgba(255, 196, 235, 0.4)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>🎁</div>
          <div>
            <div className="font-bold text-gray-900">Blind box unlocks in</div>
            <div className="text-xl font-bold text-gray-900">18 days</div>
          </div>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
          <div className="h-full bg-gray-900 rounded-full" style={{ width: '40%' }}></div>
        </div>
        <div className="mt-2 text-xs text-gray-800">12 / 30 day streak</div>
      </div>

      <div className="rounded-2xl p-4 mb-6 border" style={{ backgroundImage: 'linear-gradient(to right, #e1dabd, #f1dedc)', borderColor: '#e1dabd' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-600">Your balance</div>
            <div className="text-2xl font-bold text-gray-900">$4.50</div>
          </div>
          <div className="text-3xl">💰</div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">IRL Rewards</h2>
        <div className="space-y-3">
          {[
            { name: 'Coffee treat', price: 7.00, progress: 4.50, emoji: '☕', selected: true },
            { name: 'New book', price: 10.00, progress: 0, emoji: '📚', selected: false },
            { name: 'Face mask', price: 5.00, progress: 0, emoji: '🧖', selected: false },
          ].map((reward, i) => (
            <div
              key={i}
              className="rounded-2xl p-4 border-2 transition-all"
              style={reward.selected ? { 
                backgroundImage: 'linear-gradient(to right, rgba(171, 199, 152, 0.2), rgba(171, 199, 152, 0.3))', 
                borderColor: 'rgba(171, 199, 152, 0.5)' 
              } : { 
                backgroundColor: 'white', 
                borderColor: '#e5e7eb' 
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">{reward.emoji}</div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    {reward.name}
                    {reward.selected && <span className="text-xs text-white px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#abc798' }}>Active goal</span>}
                  </div>
                  <div className="text-sm text-gray-600">${reward.price.toFixed(2)}</div>
                </div>
              </div>
              {reward.progress > 0 && (
                <>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(reward.progress / reward.price) * 100}%`, backgroundColor: '#abc798' }}></div>
                  </div>
                  <div className="text-xs font-semibold text-gray-600">
                    ${reward.progress.toFixed(2)} / ${reward.price.toFixed(2)} • ${(reward.price - reward.progress).toFixed(2)} to go
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Cat Shop</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Daily food', price: 0.50, emoji: '🍖', essential: true },
            { name: 'Bow tie', price: 2.00, emoji: '🎀', essential: false },
            { name: 'Cat toy', price: 1.50, emoji: '🧶', essential: false },
            { name: 'Cozy bed', price: 3.00, emoji: '🛏️', essential: false },
          ].map((item, i) => (
            <button
              key={i}
              className="rounded-2xl p-4 border-2 transition-all text-left"
              style={item.essential ? {
                backgroundImage: 'linear-gradient(to bottom right, rgba(255, 196, 235, 0.4), #ffe4fa)',
                borderColor: 'rgba(255, 196, 235, 0.4)'
              } : {
                backgroundColor: 'white',
                borderColor: '#e5e7eb'
              }}
            >
              <div className="text-2xl mb-2">{item.emoji}</div>
              <div className="font-semibold text-gray-900 text-sm mb-1">{item.name}</div>
              <div className="text-xs font-bold text-gray-700">${item.price.toFixed(2)}</div>
              {item.essential && <div className="text-xs text-gray-700 font-semibold mt-1">Required daily</div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const MeScreen = () => (
    <div className="pb-28 px-6 pt-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Me</h1>
        <p className="text-gray-500 text-sm mt-1">Your profile</p>
      </div>

      <div className="rounded-2xl p-5 mb-6 border" style={{ backgroundImage: 'linear-gradient(to bottom right, #ffc4eb, #ffe4fa)', borderColor: 'rgba(255, 196, 235, 0.4)' }}>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>🐱</div>
          <div>
            <div className="text-sm text-gray-700">Your companion</div>
            <div className="text-2xl font-bold text-gray-900">Whiskers</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '12', label: 'Day streak' },
            { value: '85%', label: 'Health' },
            { value: '47', label: 'Goals done' }
          ].map((stat, i) => (
            <div key={i} className="text-center rounded-xl py-3 backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-800">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {[
          { icon: TrendingUp, label: 'Goal history', bgColor: 'rgba(171, 199, 152, 0.2)', iconColor: '#7a9970' },
          { icon: PenTool, label: 'Reflection archive', bgColor: 'rgba(255, 196, 235, 0.2)', iconColor: '#4b5563' },
          { icon: Heart, label: 'Monthly summaries', bgColor: '#ffe4fa', iconColor: '#4b5563' },
          { icon: User, label: 'Settings', bgColor: '#e5e7eb', iconColor: '#4b5563' },
        ].map((item, i) => (
          <button key={i} className="w-full bg-white rounded-2xl p-4 border-2 border-gray-200 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.bgColor }}>
                <item.icon size={20} style={{ color: item.iconColor }} />
              </div>
              <span className="font-semibold text-gray-900">{item.label}</span>
            </div>
            <div className="text-gray-400">→</div>
          </button>
        ))}
      </div>
    </div>
  );

  const CatModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full max-w-md mx-auto rounded-t-3xl p-8 animate-slide-up" style={{ backgroundImage: 'linear-gradient(to bottom right, #ffe4fa, #f1dedc, #e1dabd)' }}>
        <button onClick={() => setShowCat(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors font-bold text-gray-600">
          ✕
        </button>

        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-bounce">🐱</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Whiskers</h2>
          <p className="text-gray-700">Your happy companion</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Health</span>
              <span className="text-lg font-bold text-gray-900">85%</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '85%', backgroundColor: '#abc798' }}></div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-sm font-medium text-gray-700">Last fed</div>
              <div className="text-lg font-bold text-gray-900">Today at 9:00 AM</div>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full py-4 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: '#abc798' }}>
            Feed cat ($0.50)
          </button>
          <button className="w-full py-4 bg-white text-gray-900 rounded-2xl font-bold text-lg border-2 border-gray-300 hover:border-gray-400 transition-all">
            Customize
          </button>
        </div>

        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600">Your balance</div>
          <div className="text-2xl font-bold" style={{ color: '#7a9970' }}>$4.50</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundImage: 'linear-gradient(to bottom right, #ffe4fa, #f1dedc, #e1dabd)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
        
        * {
          font-family: 'DM Sans', sans-serif;
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>

      <div className="max-w-md mx-auto min-h-screen">
        <FloatingCat />
        
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'goals' && <GoalsScreen />}
        {activeTab === 'reflect' && <ReflectScreen />}
        {activeTab === 'rewards' && <RewardsScreen />}
        {activeTab === 'me' && <MeScreen />}
        
        <NavBar />
        
        {showCat && <CatModal />}
      </div>
    </div>
  );
};

export default SelfCareAppMockupV6;
