# ResponseCodeRunnerRunCode


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_code_runner_run_code import ResponseCodeRunnerRunCode

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeRunnerRunCode from a JSON string
response_code_runner_run_code_instance = ResponseCodeRunnerRunCode.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeRunnerRunCode.to_json())

# convert the object into a dict
response_code_runner_run_code_dict = response_code_runner_run_code_instance.to_dict()
# create an instance of ResponseCodeRunnerRunCode from a dict
response_code_runner_run_code_from_dict = ResponseCodeRunnerRunCode.from_dict(response_code_runner_run_code_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


