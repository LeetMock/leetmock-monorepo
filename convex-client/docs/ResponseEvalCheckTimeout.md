# ResponseEvalCheckTimeout


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_eval_check_timeout import ResponseEvalCheckTimeout

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseEvalCheckTimeout from a JSON string
response_eval_check_timeout_instance = ResponseEvalCheckTimeout.from_json(json)
# print the JSON string representation of the object
print(ResponseEvalCheckTimeout.to_json())

# convert the object into a dict
response_eval_check_timeout_dict = response_eval_check_timeout_instance.to_dict()
# create an instance of ResponseEvalCheckTimeout from a dict
response_eval_check_timeout_from_dict = ResponseEvalCheckTimeout.from_dict(response_eval_check_timeout_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


