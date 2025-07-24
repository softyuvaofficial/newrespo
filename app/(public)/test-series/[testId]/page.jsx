'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUserAuth } from '@/contexts/UserAuthContext';
import {
  Clock,
  Users,
  BookOpen,
  Star,
  Trophy,
  Target,
  Play,
  Lock,
} from 'lucide-react';

export default function TestSeriesDetail({ params }) {
  const { testId } = params;
  const { user } = useUserAuth();
  const router = useRouter();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    // Simulate fetching test details from backend or API
    setLoading(true);
    setTimeout(() => {
      const demoTest = {
        id: parseInt(testId),
        title: "JEE Main Mock Test 2024",
        description:
          "Comprehensive mock test for JEE Main preparation with latest pattern and detailed solutions. This test covers all subjects including Physics, Chemistry, and Mathematics with questions designed by expert faculty.",
        duration: 180,
        total_questions: 90,
        category: { name: "Engineering" },
        difficulty: "high",
        price: 199,
        is_free: false,
        rating: 4.8,
        participants_count: 1250,
        created_at: "2024-01-01",
        syllabus: [
          "Physics: Mechanics, Thermodynamics, Optics, Modern Physics",
          "Chemistry: Organic, Inorganic, Physical Chemistry",
          "Mathematics: Algebra, Calculus, Coordinate Geometry, Statistics",
        ],
        test_tabs: [
          {
            id: 1,
            name: "Mock Test",
            type: "mock",
            tests: [
              {
                id: 101,
                title: "JEE Main Mock Test 1",
                duration: 180,
                questions: 90,
                is_free: false,
                difficulty: "high",
              },
              {
                id: 102,
                title: "JEE Main Mock Test 2",
                duration: 180,
                questions: 90,
                is_free: false,
                difficulty: "high",
              },
              {
                id: 103,
                title: "JEE Main Mock Test 3 (Free)",
                duration: 180,
                questions: 90,
                is_free: true,
                difficulty: "high",
              },
            ],
          },
          {
            id: 2,
            name: "Previous Year",
            type: "pyq",
            tests: [
              {
                id: 201,
                title: "JEE Main 2023 January Session",
                duration: 180,
                questions: 90,
                is_free: false,
                difficulty: "high",
              },
              {
                id: 202,
                title: "JEE Main 2023 April Session",
                duration: 180,
                questions: 90,
                is_free: false,
                difficulty: "high",
              },
              {
                id: 203,
                title: "JEE Main 2022 June Session",
                duration: 180,
                questions: 90,
                is_free: true,
                difficulty: "high",
              },
            ],
          },
          {
            id: 3,
            name: "Booster",
            type: "booster",
            tests: [
              {
                id: 301,
                title: "Physics Booster - Mechanics",
                duration: 90,
                questions: 30,
                is_free: false,
                difficulty: "medium",
              },
              {
                id: 302,
                title: "Chemistry Booster - Organic",
                duration: 90,
                questions: 30,
                is_free: false,
                difficulty: "medium",
              },
              {
                id: 303,
                title: "Mathematics Booster - Calculus",
                duration: 90,
                questions: 30,
                is_free: true,
                difficulty: "medium",
              },
            ],
          },
        ],
      };

      setTest(demoTest);
      setLoading(false);
    }, 1000);
  }, [testId]);

  useEffect(() => {
    if (test?.test_tabs?.length) {
      setActiveTab(test.test_tabs[0].type);
    }
  }, [test]);

  const handleStartTest = (subTestId) => {
    if (!user) {
      router.push('/user-login');
      return;
    }
    // Adjust route to your real instructions page route, example below:
    router.push(`/instructions/${subTestId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-700">
          Loading test details...
        </main>
        <Footer />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Test not found</h1>
          <Button onClick={() => router.push('/test-series')}>
            Back to Test Series
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Test Header */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-4">
                  <Badge variant="outline">{test.category?.name || 'N/A'}</Badge>
                  <Badge
                    className={
                      test.difficulty === 'high'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {test.difficulty}
                  </Badge>
                  {test.is_free ? (
                    <Badge className="bg-green-100 text-green-800">Free</Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-800">
                      ₹{test.price}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {test.title}
                </h1>
                <p className="text-gray-600 text-lg mb-6">{test.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {test.duration} min
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {test.total_questions} questions
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {test.participants_count} taken
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-gray-600">
                      {test.rating}/5.0
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Get Full Access</CardTitle>
                <CardDescription>
                  Access all tests in this series with detailed solutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {test.is_free ? 'Free' : `₹${test.price}`}
                    </div>
                    {!test.is_free && (
                      <div className="text-sm text-gray-500 line-through">
                        ₹{test.price + 100}
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handleStartTest(test.id)}
                    disabled={!test.is_free && !user}
                  >
                    {test.is_free ? 'Start Free Test' : user ? 'Purchase & Start' : 'Login to Purchase'}
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    30-day money back guarantee
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Test Tabs */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              {test.test_tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.type}>
                  {tab.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {test.test_tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.type} className="mt-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {tab.name}
                    </h3>
                    <p className="text-gray-600">
                      {tab.type === 'mock' &&
                        'Full-length mock tests simulating actual exam conditions'}
                      {tab.type === 'pyq' &&
                        'Previous year questions with detailed explanations'}
                      {tab.type === 'booster' &&
                        'Topic-wise practice tests to strengthen concepts'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tab.tests.map((subTest) => (
                      <Card
                        key={subTest.id}
                        className="hover:shadow-lg transition-shadow duration-300"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">
                              {subTest.title}
                            </CardTitle>
                            {subTest.is_free ? (
                              <Badge className="bg-green-100 text-green-800">
                                Free
                              </Badge>
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>{subTest.duration} min</span>
                              <span>{subTest.questions} questions</span>
                            </div>

                            <Button
                              className="w-full"
                              variant={subTest.is_free ? 'default' : 'outline'}
                              onClick={() => handleStartTest(subTest.id)}
                              disabled={!subTest.is_free && !user}
                            >
                              {subTest.is_free ? (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Start Test
                                </>
                              ) : user ? (
                                <>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Purchase Required
                                </>
                              ) : (
                                <>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Login Required
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Syllabus & Why Choose This Test Series */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Syllabus Coverage
            </h3>
            <ul className="space-y-3">
              {test.syllabus.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-1 mt-1">
                    <Target className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Why Choose This Test Series?
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Trophy className="h-5 w-5 text-yellow-500 mt-1" />
                <span className="text-gray-700">
                  Expert-designed questions following latest patterns
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-blue-500 mt-1" />
                <span className="text-gray-700">
                  Detailed solutions with explanations
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-green-500 mt-1" />
                <span className="text-gray-700">
                  All India ranking and performance analysis
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
