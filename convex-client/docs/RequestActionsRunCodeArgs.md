# RequestActionsRunCodeArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**code** | **str** |  | 
**language** | **str** |  | 

## Example

```python
from convex_client.models.request_actions_run_code_args import RequestActionsRunCodeArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestActionsRunCodeArgs from a JSON string
request_actions_run_code_args_instance = RequestActionsRunCodeArgs.from_json(json)
# print the JSON string representation of the object
print(RequestActionsRunCodeArgs.to_json())

# convert the object into a dict
request_actions_run_code_args_dict = request_actions_run_code_args_instance.to_dict()
# create an instance of RequestActionsRunCodeArgs from a dict
request_actions_run_code_args_from_dict = RequestActionsRunCodeArgs.from_dict(request_actions_run_code_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


