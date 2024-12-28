# RequestQuestionsUpdateQuestion


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**args** | [**RequestQuestionsUpdateQuestionArgs**](RequestQuestionsUpdateQuestionArgs.md) |  | 

## Example

```python
from convex_client.models.request_questions_update_question import RequestQuestionsUpdateQuestion

# TODO update the JSON string below
json = "{}"
# create an instance of RequestQuestionsUpdateQuestion from a JSON string
request_questions_update_question_instance = RequestQuestionsUpdateQuestion.from_json(json)
# print the JSON string representation of the object
print(RequestQuestionsUpdateQuestion.to_json())

# convert the object into a dict
request_questions_update_question_dict = request_questions_update_question_instance.to_dict()
# create an instance of RequestQuestionsUpdateQuestion from a dict
request_questions_update_question_from_dict = RequestQuestionsUpdateQuestion.from_dict(request_questions_update_question_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


