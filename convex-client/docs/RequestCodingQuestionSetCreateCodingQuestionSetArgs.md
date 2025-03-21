# RequestCodingQuestionSetCreateCodingQuestionSetArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | 
**questions** | **List[str]** |  | 

## Example

```python
from convex_client.models.request_coding_question_set_create_coding_question_set_args import RequestCodingQuestionSetCreateCodingQuestionSetArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestCodingQuestionSetCreateCodingQuestionSetArgs from a JSON string
request_coding_question_set_create_coding_question_set_args_instance = RequestCodingQuestionSetCreateCodingQuestionSetArgs.from_json(json)
# print the JSON string representation of the object
print(RequestCodingQuestionSetCreateCodingQuestionSetArgs.to_json())

# convert the object into a dict
request_coding_question_set_create_coding_question_set_args_dict = request_coding_question_set_create_coding_question_set_args_instance.to_dict()
# create an instance of RequestCodingQuestionSetCreateCodingQuestionSetArgs from a dict
request_coding_question_set_create_coding_question_set_args_from_dict = RequestCodingQuestionSetCreateCodingQuestionSetArgs.from_dict(request_coding_question_set_create_coding_question_set_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


