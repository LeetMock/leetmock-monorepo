# RequestQuestionsDeleteQuestion


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**args** | [**RequestQuestionsDeleteQuestionArgs**](RequestQuestionsDeleteQuestionArgs.md) |  | 

## Example

```python
from convex_client.models.request_questions_delete_question import RequestQuestionsDeleteQuestion

# TODO update the JSON string below
json = "{}"
# create an instance of RequestQuestionsDeleteQuestion from a JSON string
request_questions_delete_question_instance = RequestQuestionsDeleteQuestion.from_json(json)
# print the JSON string representation of the object
print(RequestQuestionsDeleteQuestion.to_json())

# convert the object into a dict
request_questions_delete_question_dict = request_questions_delete_question_instance.to_dict()
# create an instance of RequestQuestionsDeleteQuestion from a dict
request_questions_delete_question_from_dict = RequestQuestionsDeleteQuestion.from_dict(request_questions_delete_question_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


