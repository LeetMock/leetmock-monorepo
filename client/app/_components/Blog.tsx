import Image from "next/image";
import { Container } from "./Container";

export const Blog = () => {
  return (
    <>
      <div id="blog">
        <Container>
          <div className="mb-12 space-y-2 text-center">
            <h2 className="text-3xl font-bold text-gray-800 md:text-4xl dark:text-white">
              Latest Blogs
            </h2>
            <p className="lg:mx-auto lg:w-6/12 text-gray-600 dark:text-gray-300">
              Read our latest blogs to learn more about our platform and interview preparation.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                image:
                  "https://images.unsplash.com/photo-1661749711934-492cd19a25c3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1674&q=80",
                title: "Product Update: New Features",
                description:
                  "We've added a new feature to our platform that allows you to practice coding interviews with AI more efficiently.",
              },
              {
                image:
                  "https://images.unsplash.com/photo-1491895200222-0fc4a4c35e18?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1674&q=80",
                title: "User Instructions for LeetMock",
                description: "Some helpful instructions for using LeetMock.",
              },
              {
                image:
                  "https://images.unsplash.com/photo-1620121692029-d088224ddc74?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=80",
                title: "How to Prepare for a Technical Interview with LeetMock",
                description: "Some tips on how to prepare for a technical interview with LeetMock.",
              },
            ].map((blog, index) => (
              <div
                key={index}
                className="group p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 dark:shadow-none dark:border-gray-700 dark:bg-gray-800 bg-opacity-50 shadow-2xl shadow-gray-600/10 flex flex-col"
              >
                <div className="relative overflow-hidden rounded-xl">
                  <Image
                    src={blog.image}
                    alt="art cover"
                    loading="lazy"
                    width="1000"
                    height="667"
                    className="h-64 w-full object-cover object-top transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    {blog.title}
                  </h3>
                  <p className="mt-6 mb-8 text-gray-600 dark:text-gray-300 flex-grow">
                    {blog.description}
                  </p>
                  <a className="inline-block mt-auto" href="#">
                    <span className="text-info dark:text-blue-300">Read more</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </>
  );
};
