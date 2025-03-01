# RequestQuestionsUpdateStatus


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**args** | [**RequestQuestionsUpdateStatusArgs**](RequestQuestionsUpdateStatusArgs.md) |  | 

## Example

```python
from convex_client.models.request_questions_update_status import RequestQuestionsUpdateStatus

# TODO update the JSON string below
json = "{}"
# create an instance of RequestQuestionsUpdateStatus from a JSON string
request_questions_update_status_instance = RequestQuestionsUpdateStatus.from_json(json)
# print the JSON string representation of the object
print(RequestQuestionsUpdateStatus.to_json())

# convert the object into a dict
request_questions_update_status_dict = request_questions_update_status_instance.to_dict()
# create an instance of RequestQuestionsUpdateStatus from a dict
request_questions_update_status_from_dict = RequestQuestionsUpdateStatus.from_dict(request_questions_update_status_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


