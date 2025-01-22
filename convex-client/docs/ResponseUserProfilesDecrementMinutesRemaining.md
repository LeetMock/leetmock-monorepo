# ResponseUserProfilesDecrementMinutesRemaining


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_user_profiles_decrement_minutes_remaining import ResponseUserProfilesDecrementMinutesRemaining

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseUserProfilesDecrementMinutesRemaining from a JSON string
response_user_profiles_decrement_minutes_remaining_instance = ResponseUserProfilesDecrementMinutesRemaining.from_json(json)
# print the JSON string representation of the object
print(ResponseUserProfilesDecrementMinutesRemaining.to_json())

# convert the object into a dict
response_user_profiles_decrement_minutes_remaining_dict = response_user_profiles_decrement_minutes_remaining_instance.to_dict()
# create an instance of ResponseUserProfilesDecrementMinutesRemaining from a dict
response_user_profiles_decrement_minutes_remaining_from_dict = ResponseUserProfilesDecrementMinutesRemaining.from_dict(response_user_profiles_decrement_minutes_remaining_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


