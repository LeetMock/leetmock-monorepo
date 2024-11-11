# RequestQuestionsGetByIdArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**question_id** | **str** | ID from table \&quot;questions\&quot; | [optional] 

## Example

```python
from convex_client.models.request_questions_get_by_id_args import RequestQuestionsGetByIdArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestQuestionsGetByIdArgs from a JSON string
request_questions_get_by_id_args_instance = RequestQuestionsGetByIdArgs.from_json(json)
# print the JSON string representation of the object
print(RequestQuestionsGetByIdArgs.to_json())

# convert the object into a dict
request_questions_get_by_id_args_dict = request_questions_get_by_id_args_instance.to_dict()
# create an instance of RequestQuestionsGetByIdArgs from a dict
request_questions_get_by_id_args_from_dict = RequestQuestionsGetByIdArgs.from_dict(request_questions_get_by_id_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


