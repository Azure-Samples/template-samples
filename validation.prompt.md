I have a GitHub repository that uses a tool to compile template projects into sample code that are built to demonstrate usage of our client libraries for Azure OpenAI.

I also have an Azure DevOps project and I have connected it to the GitHub "samples template" repo. 

My end goal is to have a samples validation pipeline so that when a new library version is released (for one or more languages) the code samples are re-generated from the template tool and then checked for correctness.

We will generate samples for all the languages we provide libraries in; C#, Java, Python, JavaScript, and Go.

The testing strategy needs account for supporting all languages we generate samples for.

I want to be able to run validation from local machine or devcontainer, or in the ADO/GH pipeline.
