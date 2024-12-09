# ResponseEvalGetBySessionId


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_eval_get_by_session_id import ResponseEvalGetBySessionId

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseEvalGetBySessionId from a JSON string
response_eval_get_by_session_id_instance = ResponseEvalGetBySessionId.from_json(json)
# print the JSON string representation of the object
print(ResponseEvalGetBySessionId.to_json())

# convert the object into a dict
response_eval_get_by_session_id_dict = response_eval_get_by_session_id_instance.to_dict()
# create an instance of ResponseEvalGetBySessionId from a dict
response_eval_get_by_session_id_from_dict = ResponseEvalGetBySessionId.from_dict(response_eval_get_by_session_id_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


