# RequestQuestionsUpdateStarredArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**question_id** | **str** | ID from table \&quot;questions\&quot; | 
**starred** | **bool** |  | 

## Example

```python
from convex_client.models.request_questions_update_starred_args import RequestQuestionsUpdateStarredArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestQuestionsUpdateStarredArgs from a JSON string
request_questions_update_starred_args_instance = RequestQuestionsUpdateStarredArgs.from_json(json)
# print the JSON string representation of the object
print(RequestQuestionsUpdateStarredArgs.to_json())

# convert the object into a dict
request_questions_update_starred_args_dict = request_questions_update_starred_args_instance.to_dict()
# create an instance of RequestQuestionsUpdateStarredArgs from a dict
request_questions_update_starred_args_from_dict = RequestQuestionsUpdateStarredArgs.from_dict(request_questions_update_starred_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


