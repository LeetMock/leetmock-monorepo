# ResponseUserProfilesDecrementEvaluationCount


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_user_profiles_decrement_evaluation_count import ResponseUserProfilesDecrementEvaluationCount

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseUserProfilesDecrementEvaluationCount from a JSON string
response_user_profiles_decrement_evaluation_count_instance = ResponseUserProfilesDecrementEvaluationCount.from_json(json)
# print the JSON string representation of the object
print(ResponseUserProfilesDecrementEvaluationCount.to_json())

# convert the object into a dict
response_user_profiles_decrement_evaluation_count_dict = response_user_profiles_decrement_evaluation_count_instance.to_dict()
# create an instance of ResponseUserProfilesDecrementEvaluationCount from a dict
response_user_profiles_decrement_evaluation_count_from_dict = ResponseUserProfilesDecrementEvaluationCount.from_dict(response_user_profiles_decrement_evaluation_count_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


