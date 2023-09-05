import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import TextBox from "../components/textbox";
import Layout from "../components/layout";
import Container from "../components/container";
import { useRouter } from "next/router";
const getpoint = "/api/getans";
const QUESTION_COUNT = 7;

export default function SubmitGuesses() {
  const [questions, setQuestions] = useState(Array(QUESTION_COUNT).fill(""));
  const [answered, setAnswered] = useState(Array(QUESTION_COUNT).fill(false));
  const [data1, setData1] = useState([]);
  const { data: session } = useSession();
  const router = useRouter();

  async function getanswers() {
    const options1 = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: session?.user.email }),
    };
    try {
      const response = await fetch(getpoint, options1);
      if (response.ok) {
        let data1 = await response.json();
        setData1(data1);
        console.log("Data1  from get answers", data1);
      } else {
        console.error("Failed to get answer");
      }
    } catch (error) {
      console.log("Error : ", error);
    }
  }

  useEffect(() => {
    console.log(answered);
  }, answered);

  useEffect(() => {
    if (!session) {
      router.push("/orientation");
    }
    if (session && router.isReady) {
      console.log("data1 from use effect", data1);
      getanswers();
    }
  }, [router, session]);

  useEffect(() => {
    const a = Array(QUESTION_COUNT).fill(false);
    for (let answ = 0; answ < data1.length; answ++) {
      a[data1[answ].questionIndex] = true;
    }
    setAnswered(a);
    console.log(questions);
  }, [data1]);

  async function uploadAnswer(questionIndex, answer) {
    if (!session) {
      router.push("/orientation");
    } else {
      if (!answer) {
        alert("Please fill out the answer");
        return;
      }

      if (answered[questionIndex]) {
        alert("You've already submitted an answer for this question");
        return;
      }

      const new_data1 = data1.map((o) => {
	      if (o.questionIndex == questionIndex) {
		      let r = {...o};
		      r.answer = answer;
		      return r;
	      }
      });
      setData1(new_data1);

      const updatedAnswered = [...answered];
      updatedAnswered[questionIndex] = true;
      setAnswered(updatedAnswered);

      const endpoint = "/api/post";

      const data = {
        email: session.user.email,
        name: session.user.name,
        questionIndex,
        answer,
      };
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      };

      try {
        const response = await fetch(endpoint, options);
      } catch (error) {
        console.error("Error submitting answer:", error);
      }
    }
  }

  return (
    <Layout>
      <Head>
        <title>&lt; Lambda /&gt; | Submit</title>
      </Head>
      <Container>
        <>
          <div className="mb-10 content-center">
            {
              questions.map((question, i) => {
                if (i > 6) return;
                return (
                  <div key={i} className="mb-5">
                    <div className="pt-5 dark:text-gray-50/80">
                      Question {i + 1}
                    </div>
                    {!answered[i] ? (
                      <>
                        <TextBox
                          placeholder={`Enter your answer for question ${
                            i + 1
                          }`}
                          value={question}
                          onChange={(e) => {
                            const updatedQuestions = [...questions];
                            updatedQuestions[i] = e.target.value;
                            setQuestions(updatedQuestions);
                          }}
                        />
                        <button
                          type="button"
                          disabled={answered[i]}
                          className="px-4 py-2 bg-neutral-900 dark:text-gray-50/80 rounded-3xl mt-2"
                          onClick={() => uploadAnswer(i, questions[i])}
                        >
                          Submit Answer
                        </button>
                      </>
                    ) : (
                      <div className="text-green-500 mt-2">
                        Answer submitted:-{" "}
                        {data1.map((item) => {
                          if (item.questionIndex == i) {
                            return item.answer;
                          }
                        })}
                      </div>
                    )}
                  </div>
                );
              })
	    }
          </div>
        </>
      </Container>
    </Layout>
  );
}
